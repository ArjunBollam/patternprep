(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, pre } = K;

  K.chapters('object-oriented-design-interview', [
    {
      id: 'atm-system',
      title: 'Design an ATM',
      body: [
        p("Design the software for an automated teller machine: a customer inserts a card, enters a PIN, and withdraws cash, deposits or checks the balance. The ATM talks to the bank's backend and dispenses notes from cassettes of different denominations."),
        h('Requirements'),
        ul("Authenticate with card + PIN (3 wrong attempts retains the card).", "Operations: balance inquiry, withdrawal, deposit.", "Dispense cash using available notes (e.g. 100, 50, 20); reject amounts the machine can't make.", "The bank backend is the source of truth for balances."),
        h('Classes and patterns'),
        ul(
          "**State pattern** for the session: `Idle` → `CardInserted` → `Authenticated` → back to `Idle`.",
          "**Chain of responsibility** for dispensing: each `NoteDispenser` handles as many notes of its denomination as it can, then passes the remainder to the next.",
          "`BankService` interface hides the backend (easy to mock in tests)."
        ),
        flow({ nodes: { atm: [1, 0, 'ATM\nstate, session'], bank: [2.3, 0, 'BankService\n«interface»', 'ext'], d1: [0, 1.3, 'Dispenser $100'], d2: [1, 1.3, 'Dispenser $50'], d3: [2, 1.3, 'Dispenser $20'] },
          edges: [['atm', 'bank', 'verify, debit'], ['atm', 'd1', 'dispense'], ['d1', 'd2', 'remainder'], ['d2', 'd3', 'remainder']], ux: 165 }),
        h('Implementation'),
        code({ java: `
          interface BankService {
              boolean verifyPin(String card, String pin);
              long balance(String card);
              boolean debit(String card, long amount);
          }

          class NoteDispenser {
              final int note;
              int count;
              NoteDispenser next;
              NoteDispenser(int note, int count) { this.note = note; this.count = count; }

              /** Plan notes for amount; returns remaining amount this chain could not cover. */
              int plan(int amount, Map<Integer, Integer> out) {
                  int use = Math.min(amount / note, count);
                  if (use > 0) out.put(note, use);
                  int rest = amount - use * note;
                  return (rest > 0 && next != null) ? next.plan(rest, out) : rest;
              }
          }

          class Atm {
              enum State { IDLE, CARD_INSERTED, AUTHENTICATED }

              private final BankService bank;
              private final NoteDispenser chain;
              private State state = State.IDLE;
              private String card;
              private int failedPins;

              Atm(BankService bank, NoteDispenser chain) { this.bank = bank; this.chain = chain; }

              void insertCard(String card) {
                  if (state != State.IDLE) throw new IllegalStateException("Card already inserted");
                  this.card = card;
                  failedPins = 0;
                  state = State.CARD_INSERTED;
              }

              boolean enterPin(String pin) {
                  if (state != State.CARD_INSERTED) throw new IllegalStateException("Insert card first");
                  if (bank.verifyPin(card, pin)) { state = State.AUTHENTICATED; return true; }
                  if (++failedPins >= 3) eject();   // a real ATM would retain the card
                  return false;
              }

              Map<Integer, Integer> withdraw(int amount) {
                  if (state != State.AUTHENTICATED) throw new IllegalStateException("Not authenticated");
                  Map<Integer, Integer> notes = new TreeMap<>(Comparator.reverseOrder());
                  if (chain.plan(amount, notes) != 0) throw new IllegalArgumentException("Cannot dispense " + amount);
                  if (!bank.debit(card, amount)) throw new IllegalStateException("Insufficient funds");
                  for (NoteDispenser d = chain; d != null; d = d.next) d.count -= notes.getOrDefault(d.note, 0);
                  return notes;
              }

              void eject() { card = null; state = State.IDLE; }
          }
          `, py: `
          from abc import ABC, abstractmethod
          from enum import Enum
          from typing import Dict, Optional

          class BankService(ABC):
              @abstractmethod
              def verify_pin(self, card: str, pin: str) -> bool: ...
              @abstractmethod
              def debit(self, card: str, amount: int) -> bool: ...

          class NoteDispenser:
              def __init__(self, note: int, count: int, next_: Optional["NoteDispenser"] = None):
                  self.note, self.count, self.next = note, count, next_

              def plan(self, amount: int, out: Dict[int, int]) -> int:
                  """Plan notes for amount; return what the chain could not cover."""
                  use = min(amount // self.note, self.count)
                  if use:
                      out[self.note] = use
                  rest = amount - use * self.note
                  return self.next.plan(rest, out) if rest and self.next else rest

          class State(Enum):
              IDLE = 1
              CARD_INSERTED = 2
              AUTHENTICATED = 3

          class Atm:
              def __init__(self, bank: BankService, chain: NoteDispenser):
                  self.bank, self.chain = bank, chain
                  self.state, self.card, self.failed_pins = State.IDLE, None, 0

              def insert_card(self, card: str) -> None:
                  if self.state is not State.IDLE:
                      raise RuntimeError("Card already inserted")
                  self.card, self.failed_pins, self.state = card, 0, State.CARD_INSERTED

              def enter_pin(self, pin: str) -> bool:
                  if self.state is not State.CARD_INSERTED:
                      raise RuntimeError("Insert card first")
                  if self.bank.verify_pin(self.card, pin):
                      self.state = State.AUTHENTICATED
                      return True
                  self.failed_pins += 1
                  if self.failed_pins >= 3:
                      self.eject()          # a real ATM would retain the card
                  return False

              def withdraw(self, amount: int) -> Dict[int, int]:
                  if self.state is not State.AUTHENTICATED:
                      raise RuntimeError("Not authenticated")
                  notes: Dict[int, int] = {}
                  if self.chain.plan(amount, notes) != 0:
                      raise ValueError(f"Cannot dispense {amount}")
                  if not self.bank.debit(self.card, amount):
                      raise RuntimeError("Insufficient funds")
                  d = self.chain
                  while d:
                      d.count -= notes.get(d.note, 0)
                      d = d.next
                  return notes

              def eject(self) -> None:
                  self.card, self.state = None, State.IDLE
          ` }),
        note("Greedy dispensing (largest note first) can fail for some amounts even when a combination exists, e.g. 60 with only 50s and 20s (50 + ? fails, but 20 × 3 works). A production ATM would try alternatives or use DP over the available notes; mention this trade-off."),
        h('Extensions'),
        ul("Deposits with envelope or note counting.", "Receipts and audit logs (Observer).", "Network failures between debit and dispense: record a pending transaction and reconcile."),
      ],
    },

    {
      id: 'unix-file-search',
      title: 'Design Unix File Search',
      body: [
        p("Design an API like the Unix `find` command: search a directory tree for files matching criteria such as name pattern, extension and size, combined with AND / OR. New criteria must be easy to add."),
        h('Requirements'),
        ul("Recursively walk a directory tree.", "Filters: name contains, extension, size greater/less than.", "Combine filters with AND, OR and NOT.", "Extensible: adding a \"modified after\" filter shouldn't change existing code."),
        h('Design'),
        ul(
          "**Composite pattern** for the file tree: `Directory` contains `File`s and other `Directory`s.",
          "**Specification / Strategy pattern** for filters: each `Filter` answers `matches(file)`, and `AndFilter`, `OrFilter`, `NotFilter` combine other filters into a tree of conditions (Open/Closed Principle)."
        ),
        flow({ nodes: { f: [1, 0, 'Filter\n«interface»', 'ext'], n: [0, 1.2, 'NameFilter'], s: [1, 1.2, 'SizeFilter'], e: [2, 1.2, 'ExtensionFilter'], a: [3, 1.2, 'AndFilter /\nOrFilter / NotFilter'] },
          edges: [['n', 'f', 'implements', 'dash'], ['s', 'f', '', 'dash'], ['e', 'f', '', 'dash'], ['a', 'f', 'wraps filters', 'dash']], ux: 165 }),
        h('Implementation'),
        code({ java: `
          class FileNode {
              final String name;
              final long size;
              final boolean isDirectory;
              final List<FileNode> children = new ArrayList<>();
              FileNode(String name, long size, boolean isDirectory) { this.name = name; this.size = size; this.isDirectory = isDirectory; }
              FileNode add(FileNode child) { children.add(child); return this; }
          }

          interface Filter {
              boolean matches(FileNode f);
              default Filter and(Filter other) { return f -> matches(f) && other.matches(f); }
              default Filter or(Filter other) { return f -> matches(f) || other.matches(f); }
              default Filter negate() { return f -> !matches(f); }
          }

          class Filters {
              static Filter nameContains(String s) { return f -> f.name.contains(s); }
              static Filter extension(String ext) { return f -> f.name.endsWith("." + ext); }
              static Filter minSize(long bytes) { return f -> f.size >= bytes; }
          }

          class FileSearch {
              List<FileNode> find(FileNode root, Filter filter) {
                  List<FileNode> out = new ArrayList<>();
                  Deque<FileNode> stack = new ArrayDeque<>(List.of(root));
                  while (!stack.isEmpty()) {          // iterative DFS avoids deep recursion
                      FileNode node = stack.pop();
                      if (node.isDirectory) node.children.forEach(stack::push);
                      else if (filter.matches(node)) out.add(node);
                  }
                  return out;
              }
          }
          // new FileSearch().find(root, Filters.extension("log").and(Filters.minSize(1_000_000)));
          `, py: `
          from abc import ABC, abstractmethod
          from typing import List

          class FileNode:
              def __init__(self, name: str, size: int = 0, is_directory: bool = False):
                  self.name, self.size, self.is_directory = name, size, is_directory
                  self.children: List["FileNode"] = []

              def add(self, child: "FileNode") -> "FileNode":
                  self.children.append(child)
                  return self

          class Filter(ABC):
              @abstractmethod
              def matches(self, f: FileNode) -> bool: ...

              def __and__(self, other: "Filter") -> "Filter":
                  return _Combined(lambda f: self.matches(f) and other.matches(f))

              def __or__(self, other: "Filter") -> "Filter":
                  return _Combined(lambda f: self.matches(f) or other.matches(f))

              def __invert__(self) -> "Filter":
                  return _Combined(lambda f: not self.matches(f))

          class _Combined(Filter):
              def __init__(self, fn):
                  self.fn = fn

              def matches(self, f: FileNode) -> bool:
                  return self.fn(f)

          class NameContains(Filter):
              def __init__(self, text: str):
                  self.text = text

              def matches(self, f):
                  return self.text in f.name

          class Extension(Filter):
              def __init__(self, ext: str):
                  self.ext = ext

              def matches(self, f):
                  return f.name.endswith("." + self.ext)

          class MinSize(Filter):
              def __init__(self, size: int):
                  self.size = size

              def matches(self, f):
                  return f.size >= self.size

          def find(root: FileNode, flt: Filter) -> List[FileNode]:
              out, stack = [], [root]
              while stack:                    # iterative DFS avoids deep recursion
                  node = stack.pop()
                  if node.is_directory:
                      stack.extend(node.children)
                  elif flt.matches(node):
                      out.append(node)
              return out

          # find(root, Extension("log") & MinSize(1_000_000))
          ` }),
        h('Extensions'),
        ul("Real file systems: wrap OS directory listings behind the same `FileNode` interface (Adapter).", "Symlink cycles: track visited inodes.", "Parallel search across subdirectories; stream results lazily instead of collecting a list."),
      ],
    },

    {
      id: 'blackjack-card-game',
      title: 'Design a Card Game: Blackjack',
      body: [
        p("Model a deck of cards and the game of Blackjack: players are dealt cards and try to get as close to 21 as possible without going over; the dealer must hit until reaching 17. This tests modelling of reusable building blocks (cards, decks, hands) plus game rules."),
        h('Requirements'),
        ul("Standard 52-card deck (optionally several decks in a shoe), shuffled.", "Card values: 2-10 face value, J/Q/K = 10, Ace = 1 or 11.", "Players hit or stand; dealer hits below 17.", "Determine the outcome: win, lose, push (tie), blackjack."),
        h('Classes'),
        ul("`Suit`, `Rank` enums and an immutable `Card`.", "`Deck` (shuffle, deal) reusable by any card game.", "`Hand` computes the best Blackjack score, treating Aces as 11 when that doesn't bust.", "`BlackjackGame` holds the rules and the flow."),
        h('Implementation'),
        code({ java: `
          enum Suit { CLUBS, DIAMONDS, HEARTS, SPADES }

          enum Rank {
              TWO(2), THREE(3), FOUR(4), FIVE(5), SIX(6), SEVEN(7), EIGHT(8), NINE(9), TEN(10),
              JACK(10), QUEEN(10), KING(10), ACE(11);
              final int value;
              Rank(int value) { this.value = value; }
          }

          record Card(Rank rank, Suit suit) {}

          class Deck {
              private final Deque<Card> cards = new ArrayDeque<>();

              Deck(int decks, Random random) {
                  List<Card> all = new ArrayList<>();
                  for (int d = 0; d < decks; d++)
                      for (Suit s : Suit.values())
                          for (Rank r : Rank.values()) all.add(new Card(r, s));
                  Collections.shuffle(all, random);
                  cards.addAll(all);
              }

              Card deal() { return cards.pop(); }
          }

          class Hand {
              final List<Card> cards = new ArrayList<>();
              void add(Card c) { cards.add(c); }

              int score() {
                  int total = 0, aces = 0;
                  for (Card c : cards) {
                      total += c.rank().value;
                      if (c.rank() == Rank.ACE) aces++;
                  }
                  while (total > 21 && aces-- > 0) total -= 10; // count an Ace as 1 instead of 11
                  return total;
              }

              boolean isBust() { return score() > 21; }
              boolean isBlackjack() { return cards.size() == 2 && score() == 21; }
          }

          class BlackjackGame {
              enum Outcome { PLAYER_BLACKJACK, PLAYER_WINS, DEALER_WINS, PUSH }

              final Deck deck;
              final Hand player = new Hand(), dealer = new Hand();

              BlackjackGame(Deck deck) {
                  this.deck = deck;
                  player.add(deck.deal()); dealer.add(deck.deal());
                  player.add(deck.deal()); dealer.add(deck.deal());
              }

              void playerHit() { player.add(deck.deal()); }

              Outcome finish() {
                  if (player.isBust()) return Outcome.DEALER_WINS;
                  if (player.isBlackjack()) {               // naturals settle immediately
                      return dealer.isBlackjack() ? Outcome.PUSH : Outcome.PLAYER_BLACKJACK;
                  }
                  while (dealer.score() < 17) dealer.add(deck.deal()); // dealer rule
                  if (dealer.isBust() || player.score() > dealer.score()) return Outcome.PLAYER_WINS;
                  if (player.score() < dealer.score()) return Outcome.DEALER_WINS;
                  return Outcome.PUSH;
              }
          }
          `, py: `
          import random
          from dataclasses import dataclass
          from enum import Enum
          from typing import List

          class Suit(Enum):
              CLUBS = "♣"
              DIAMONDS = "♦"
              HEARTS = "♥"
              SPADES = "♠"

          RANKS = {"2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
                   "J": 10, "Q": 10, "K": 10, "A": 11}

          @dataclass(frozen=True)
          class Card:
              rank: str
              suit: Suit

          class Deck:
              def __init__(self, decks: int = 1, rng: random.Random = None):
                  self.cards = [Card(r, s) for _ in range(decks) for s in Suit for r in RANKS]
                  (rng or random).shuffle(self.cards)

              def deal(self) -> Card:
                  return self.cards.pop()

          class Hand:
              def __init__(self, cards: List[Card] = None):
                  self.cards = list(cards or [])

              def add(self, card: Card) -> None:
                  self.cards.append(card)

              def score(self) -> int:
                  total = sum(RANKS[c.rank] for c in self.cards)
                  aces = sum(c.rank == "A" for c in self.cards)
                  while total > 21 and aces:      # count an Ace as 1 instead of 11
                      total -= 10
                      aces -= 1
                  return total

              def is_bust(self) -> bool:
                  return self.score() > 21

              def is_blackjack(self) -> bool:
                  return len(self.cards) == 2 and self.score() == 21

          class BlackjackGame:
              def __init__(self, deck: Deck):
                  self.deck = deck
                  self.player, self.dealer = Hand(), Hand()
                  for _ in range(2):
                      self.player.add(deck.deal())
                      self.dealer.add(deck.deal())

              def player_hit(self) -> None:
                  self.player.add(self.deck.deal())

              def finish(self) -> str:
                  if self.player.is_bust():
                      return "dealer wins"
                  if self.player.is_blackjack():   # naturals settle immediately
                      return "push" if self.dealer.is_blackjack() else "player blackjack"
                  while self.dealer.score() < 17:  # dealer rule
                      self.dealer.add(self.deck.deal())
                  if self.dealer.is_bust() or self.player.score() > self.dealer.score():
                      return "player wins"
                  if self.player.score() < self.dealer.score():
                      return "dealer wins"
                  return "push"
          ` }),
        h('Extensions'),
        ul("Multiple players and betting (a `Player` with a bankroll).", "Splitting pairs and doubling down: a player can own several hands.", "Reuse `Deck` and `Card` for other games (poker, solitaire) — the main benefit of separating them from Blackjack rules."),
      ],
    },
  ]);
})();
