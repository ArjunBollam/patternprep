(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, pre } = K;

  K.chapters('object-oriented-design-interview', [
    {
      id: 'vending-machine',
      title: 'Design a Vending Machine',
      body: [
        p("Design a vending machine that lets a user select a product, insert money, receive the product and get change. The machine behaves differently depending on what has happened so far, which makes it the textbook case for the **State pattern**."),
        h('Requirements'),
        ul("Products in slots with price and quantity.", "Flow: select product → insert coins/notes → dispense product and change.", "Cancel at any time returns inserted money.", "Reject selection of sold-out products; reject purchase if exact change can't be made (keep it simple: assume enough change)."),
        h('States'),
        flow({ nodes: { idle: [0, 0, 'Idle'], sel: [1.4, 0, 'HasSelection\naccepting money'], disp: [2.8, 0, 'Dispense\nproduct + change'] },
          edges: [['idle', 'sel', 'select'], ['sel', 'disp', 'balance ≥ price'], ['disp', 'idle', 'reset to idle', 'dash']], ux: 165 }),
        p("Inserting money keeps the machine in `HasSelection` until the balance covers the price; `cancel` refunds and returns to `Idle`. Without the State pattern, every method becomes a `switch` on the current state. With it, each state is a class that handles only the actions valid in that state, and transitions by setting the machine's next state."),
        h('Implementation'),
        code({ java: `
          class Product {
              final String code, name;
              final int priceCents;
              int quantity;
              Product(String code, String name, int priceCents, int quantity) {
                  this.code = code; this.name = name; this.priceCents = priceCents; this.quantity = quantity;
              }
          }

          interface MachineState {
              default void select(VendingMachine m, String code) { throw new IllegalStateException("Can't select now"); }
              default void insert(VendingMachine m, int cents) { throw new IllegalStateException("Select a product first"); }
              default int cancel(VendingMachine m) { return 0; }
          }

          class IdleState implements MachineState {
              public void select(VendingMachine m, String code) {
                  Product p = m.inventory.get(code);
                  if (p == null || p.quantity == 0) throw new IllegalArgumentException("Unavailable: " + code);
                  m.selected = p;
                  m.state = new HasSelectionState();
              }
          }

          class HasSelectionState implements MachineState {
              public void insert(VendingMachine m, int cents) {
                  m.balance += cents;
                  if (m.balance >= m.selected.priceCents) m.dispense();
              }
              public int cancel(VendingMachine m) {
                  int refund = m.balance;
                  m.reset();
                  return refund;
              }
          }

          class VendingMachine {
              final Map<String, Product> inventory = new HashMap<>();
              MachineState state = new IdleState();
              Product selected;
              int balance;
              int lastChange;

              void addProduct(Product p) { inventory.put(p.code, p); }
              void select(String code) { state.select(this, code); }
              void insert(int cents) { state.insert(this, cents); }
              int cancel() { return state.cancel(this); }

              void dispense() {
                  selected.quantity--;
                  lastChange = balance - selected.priceCents;   // returned to the user
                  reset();
              }

              void reset() {
                  selected = null;
                  balance = 0;
                  state = new IdleState();
              }
          }
          `, py: `
          from typing import Dict, Optional

          class Product:
              def __init__(self, code: str, name: str, price_cents: int, quantity: int):
                  self.code, self.name, self.price_cents, self.quantity = code, name, price_cents, quantity

          class MachineState:
              def select(self, m: "VendingMachine", code: str) -> None:
                  raise RuntimeError("Can't select now")

              def insert(self, m: "VendingMachine", cents: int) -> None:
                  raise RuntimeError("Select a product first")

              def cancel(self, m: "VendingMachine") -> int:
                  return 0

          class IdleState(MachineState):
              def select(self, m, code):
                  product = m.inventory.get(code)
                  if product is None or product.quantity == 0:
                      raise ValueError(f"Unavailable: {code}")
                  m.selected = product
                  m.state = HasSelectionState()

          class HasSelectionState(MachineState):
              def insert(self, m, cents):
                  m.balance += cents
                  if m.balance >= m.selected.price_cents:
                      m.dispense()

              def cancel(self, m):
                  refund = m.balance
                  m.reset()
                  return refund

          class VendingMachine:
              def __init__(self):
                  self.inventory: Dict[str, Product] = {}
                  self.state: MachineState = IdleState()
                  self.selected: Optional[Product] = None
                  self.balance = 0
                  self.last_change = 0

              def add_product(self, p: Product) -> None:
                  self.inventory[p.code] = p

              def select(self, code: str) -> None:
                  self.state.select(self, code)

              def insert(self, cents: int) -> None:
                  self.state.insert(self, cents)

              def cancel(self) -> int:
                  return self.state.cancel(self)

              def dispense(self) -> None:
                  self.selected.quantity -= 1
                  self.last_change = self.balance - self.selected.price_cents
                  self.reset()

              def reset(self) -> None:
                  self.selected, self.balance, self.state = None, 0, IdleState()
          ` }),
        h('Extensions'),
        ul("Exact-change mode: track a coin inventory and compute change greedily (or with DP for unusual denominations).", "Card payments: a `PaymentMethod` strategy.", "Maintenance state for restocking; an Observer that alerts operators when stock is low."),
      ],
    },

    {
      id: 'library-management-system',
      title: 'Design a Library Management System',
      body: [
        p("Design a system for a library: members search the catalogue, borrow and return book copies, place holds, and pay fines for late returns."),
        h('Requirements'),
        ul("A **book** (title, author, ISBN) can have many physical **copies** (book items) with barcodes.", "Members can borrow up to 5 copies for 14 days.", "Late returns incur a fine per day.", "Members can place a hold on a book when no copy is available; the next returned copy is reserved for them.", "Search by title, author or ISBN."),
        h('Classes'),
        flow({ nodes: { lib: [1, 0, 'Library\ncheckout(), return()'], cat: [0, 1.2, 'Catalog\nsearch'], book: [0, 2.4, 'Book\nisbn, title, author'], item: [1, 2.4, 'BookItem\nbarcode, status'], mem: [2, 1.2, 'Member\nloans, fines'], loan: [2, 2.4, 'Loan\nitem, due date'] },
          edges: [['lib', 'cat'], ['cat', 'book'], ['book', 'item', '1..*'], ['lib', 'mem'], ['mem', 'loan', '0..5'], ['loan', 'item']], ux: 170 }),
        note("Separating `Book` (the title) from `BookItem` (a physical copy) is the key modelling decision. Searching works on books; borrowing works on items."),
        h('Implementation'),
        code({ java: `
          enum ItemStatus { AVAILABLE, LOANED, ON_HOLD }

          class Book {
              final String isbn, title, author;
              final List<BookItem> items = new ArrayList<>();
              final Deque<Member> holds = new ArrayDeque<>();
              Book(String isbn, String title, String author) { this.isbn = isbn; this.title = title; this.author = author; }
          }

          class BookItem {
              final String barcode;
              final Book book;
              ItemStatus status = ItemStatus.AVAILABLE;
              Member reservedFor;
              BookItem(String barcode, Book book) { this.barcode = barcode; this.book = book; }
          }

          class Loan {
              final BookItem item;
              final LocalDateTime due;
              Loan(BookItem item, LocalDateTime due) { this.item = item; this.due = due; }
          }

          class Member {
              final String id;
              final Map<String, Loan> loans = new HashMap<>(); // barcode -> loan
              int finesCents;
              Member(String id) { this.id = id; }
          }

          class Library {
              static final int MAX_LOANS = 5, LOAN_DAYS = 14, FINE_PER_DAY_CENTS = 25;
              private final Map<String, Book> booksByIsbn = new HashMap<>();
              private final Map<String, BookItem> itemsByBarcode = new HashMap<>();

              void addCopy(Book book, String barcode) {
                  booksByIsbn.putIfAbsent(book.isbn, book);
                  BookItem item = new BookItem(barcode, book);
                  book.items.add(item);
                  itemsByBarcode.put(barcode, item);
              }

              List<Book> searchByTitle(String text) {
                  String q = text.toLowerCase();
                  return booksByIsbn.values().stream().filter(b -> b.title.toLowerCase().contains(q)).toList();
              }

              Loan checkout(Member m, String barcode, LocalDateTime now) {
                  BookItem item = itemsByBarcode.get(barcode);
                  if (m.loans.size() >= MAX_LOANS) throw new IllegalStateException("Loan limit reached");
                  if (m.finesCents > 0) throw new IllegalStateException("Outstanding fines");
                  boolean reservedForMe = item.status == ItemStatus.ON_HOLD && item.reservedFor == m;
                  if (item.status != ItemStatus.AVAILABLE && !reservedForMe) throw new IllegalStateException("Not available");
                  item.status = ItemStatus.LOANED;
                  item.reservedFor = null;
                  Loan loan = new Loan(item, now.plusDays(LOAN_DAYS));
                  m.loans.put(barcode, loan);
                  return loan;
              }

              void returnItem(Member m, String barcode, LocalDateTime now) {
                  Loan loan = m.loans.remove(barcode);
                  if (loan == null) throw new IllegalArgumentException("Not loaned to this member");
                  long lateDays = Math.max(0, Duration.between(loan.due, now).toDays());
                  m.finesCents += (int) lateDays * FINE_PER_DAY_CENTS;
                  BookItem item = loan.item;
                  Member next = item.book.holds.poll();
                  if (next != null) {             // reserve for the first person waiting
                      item.status = ItemStatus.ON_HOLD;
                      item.reservedFor = next;
                  } else {
                      item.status = ItemStatus.AVAILABLE;
                  }
              }

              void placeHold(Member m, String isbn) {
                  booksByIsbn.get(isbn).holds.offer(m);
              }
          }
          `, py: `
          from collections import deque
          from datetime import datetime, timedelta
          from enum import Enum
          from typing import Dict, List, Optional

          class ItemStatus(Enum):
              AVAILABLE = "available"
              LOANED = "loaned"
              ON_HOLD = "on_hold"

          class Book:
              def __init__(self, isbn: str, title: str, author: str):
                  self.isbn, self.title, self.author = isbn, title, author
                  self.items: List["BookItem"] = []
                  self.holds = deque()

          class BookItem:
              def __init__(self, barcode: str, book: Book):
                  self.barcode, self.book = barcode, book
                  self.status = ItemStatus.AVAILABLE
                  self.reserved_for: Optional["Member"] = None

          class Loan:
              def __init__(self, item: BookItem, due: datetime):
                  self.item, self.due = item, due

          class Member:
              def __init__(self, member_id: str):
                  self.id = member_id
                  self.loans: Dict[str, Loan] = {}
                  self.fines_cents = 0

          class Library:
              MAX_LOANS, LOAN_DAYS, FINE_PER_DAY_CENTS = 5, 14, 25

              def __init__(self):
                  self.books: Dict[str, Book] = {}
                  self.items: Dict[str, BookItem] = {}

              def add_copy(self, book: Book, barcode: str) -> None:
                  book = self.books.setdefault(book.isbn, book)
                  item = BookItem(barcode, book)
                  book.items.append(item)
                  self.items[barcode] = item

              def search_by_title(self, text: str) -> List[Book]:
                  return [b for b in self.books.values() if text.lower() in b.title.lower()]

              def checkout(self, m: Member, barcode: str, now: datetime) -> Loan:
                  item = self.items[barcode]
                  if len(m.loans) >= self.MAX_LOANS:
                      raise RuntimeError("Loan limit reached")
                  if m.fines_cents > 0:
                      raise RuntimeError("Outstanding fines")
                  reserved_for_me = item.status is ItemStatus.ON_HOLD and item.reserved_for is m
                  if item.status is not ItemStatus.AVAILABLE and not reserved_for_me:
                      raise RuntimeError("Not available")
                  item.status, item.reserved_for = ItemStatus.LOANED, None
                  loan = Loan(item, now + timedelta(days=self.LOAN_DAYS))
                  m.loans[barcode] = loan
                  return loan

              def return_item(self, m: Member, barcode: str, now: datetime) -> None:
                  loan = m.loans.pop(barcode)
                  late_days = max(0, (now - loan.due).days)
                  m.fines_cents += late_days * self.FINE_PER_DAY_CENTS
                  item = loan.item
                  if item.book.holds:                 # reserve for the first person waiting
                      item.status, item.reserved_for = ItemStatus.ON_HOLD, item.book.holds.popleft()
                  else:
                      item.status = ItemStatus.AVAILABLE

              def place_hold(self, m: Member, isbn: str) -> None:
                  self.books[isbn].holds.append(m)
          ` }),
        h('Extensions'),
        ul("Notifications when a held copy becomes available (Observer).", "Different member types with different limits (Strategy or configuration).", "Renewals, hold expiry, and search indexes for author and ISBN."),
      ],
    },

    {
      id: 'movie-ticket-booking',
      title: 'Design a Movie Ticket Booking System',
      body: [
        p("Design the core of a cinema booking system: users browse shows, pick seats on a seat map, hold them while paying, and receive a booking."),
        h('Requirements'),
        ul("Cinemas have screens; each screen has a seat layout (regular, premium).", "A **show** is a movie on a screen at a time; seat prices depend on seat type.", "Users select seats; those seats are **held** for a few minutes while payment happens.", "**No double booking**, even when two users click the same seat at once.", "Holds expire automatically if payment doesn't complete."),
        h('Classes'),
        flow({ nodes: { movie: [0, 0, 'Movie'], show: [1, 0, 'Show\nmovie, screen, time'], screen: [2, 0, 'Screen\nseats'], seat: [2, 1.2, 'Seat\nrow, number, type'], ss: [1, 1.2, 'ShowSeat\nstatus, heldUntil'], booking: [0, 1.2, 'Booking\nuser, seats, total'], svc: [1, 2.4, 'BookingService\nhold(), confirm()'] },
          edges: [['show', 'movie'], ['show', 'screen'], ['screen', 'seat', '1..*'], ['show', 'ss', '1..*'], ['ss', 'seat'], ['booking', 'ss'], ['svc', 'show']], ux: 170 }),
        p("The key insight: a seat's availability belongs to a **show**, not to the seat. `ShowSeat` combines the two and carries the status (`AVAILABLE`, `HELD`, `BOOKED`)."),
        h('Concurrency'),
        p("Two users may try to hold the same seat at the same moment. The hold must be **atomic**: check that every requested seat is free and mark them all held, or fail without changing anything. In one process, a lock per show is enough. In a real distributed system, the same rule is enforced in the database: a conditional update (`UPDATE show_seat SET status='HELD' … WHERE status='AVAILABLE'`) inside a transaction, or a row lock."),
        h('Implementation'),
        code({ java: `
          enum SeatStatus { AVAILABLE, HELD, BOOKED }

          class ShowSeat {
              final String seatId;
              final int priceCents;
              SeatStatus status = SeatStatus.AVAILABLE;
              String heldBy;
              long heldUntil;
              ShowSeat(String seatId, int priceCents) { this.seatId = seatId; this.priceCents = priceCents; }
          }

          class Show {
              final String id;
              final Map<String, ShowSeat> seats = new HashMap<>();
              Show(String id) { this.id = id; }
          }

          class Booking {
              final String userId;
              final List<String> seatIds;
              final int totalCents;
              Booking(String userId, List<String> seatIds, int totalCents) {
                  this.userId = userId; this.seatIds = seatIds; this.totalCents = totalCents;
              }
          }

          class BookingService {
              static final long HOLD_MILLIS = 5 * 60 * 1000;

              /** Atomically hold all seats or none. */
              boolean hold(Show show, String userId, List<String> seatIds, long now) {
                  synchronized (show) {
                      for (String id : seatIds) {
                          ShowSeat s = show.seats.get(id);
                          boolean expiredHold = s.status == SeatStatus.HELD && s.heldUntil < now;
                          if (s.status != SeatStatus.AVAILABLE && !expiredHold) return false;
                      }
                      for (String id : seatIds) {
                          ShowSeat s = show.seats.get(id);
                          s.status = SeatStatus.HELD;
                          s.heldBy = userId;
                          s.heldUntil = now + HOLD_MILLIS;
                      }
                      return true;
                  }
              }

              /** Called after successful payment. */
              Booking confirm(Show show, String userId, List<String> seatIds, long now) {
                  synchronized (show) {
                      int total = 0;
                      for (String id : seatIds) {
                          ShowSeat s = show.seats.get(id);
                          if (s.status != SeatStatus.HELD || !userId.equals(s.heldBy) || s.heldUntil < now) {
                              throw new IllegalStateException("Hold expired for seat " + id);
                          }
                          total += s.priceCents;
                      }
                      for (String id : seatIds) show.seats.get(id).status = SeatStatus.BOOKED;
                      return new Booking(userId, List.copyOf(seatIds), total);
                  }
              }
          }
          `, py: `
          import threading
          from enum import Enum
          from typing import Dict, List

          HOLD_SECONDS = 5 * 60

          class SeatStatus(Enum):
              AVAILABLE = 1
              HELD = 2
              BOOKED = 3

          class ShowSeat:
              def __init__(self, seat_id: str, price_cents: int):
                  self.seat_id, self.price_cents = seat_id, price_cents
                  self.status = SeatStatus.AVAILABLE
                  self.held_by = None
                  self.held_until = 0.0

          class Show:
              def __init__(self, show_id: str, seats: List[ShowSeat]):
                  self.id = show_id
                  self.seats: Dict[str, ShowSeat] = {s.seat_id: s for s in seats}
                  self.lock = threading.Lock()

          class Booking:
              def __init__(self, user_id: str, seat_ids: List[str], total_cents: int):
                  self.user_id, self.seat_ids, self.total_cents = user_id, seat_ids, total_cents

          class BookingService:
              def hold(self, show: Show, user_id: str, seat_ids: List[str], now: float) -> bool:
                  """Atomically hold all seats or none."""
                  with show.lock:
                      for sid in seat_ids:
                          s = show.seats[sid]
                          expired = s.status is SeatStatus.HELD and s.held_until < now
                          if s.status is not SeatStatus.AVAILABLE and not expired:
                              return False
                      for sid in seat_ids:
                          s = show.seats[sid]
                          s.status, s.held_by, s.held_until = SeatStatus.HELD, user_id, now + HOLD_SECONDS
                      return True

              def confirm(self, show: Show, user_id: str, seat_ids: List[str], now: float) -> Booking:
                  """Called after successful payment."""
                  with show.lock:
                      total = 0
                      for sid in seat_ids:
                          s = show.seats[sid]
                          if s.status is not SeatStatus.HELD or s.held_by != user_id or s.held_until < now:
                              raise RuntimeError(f"Hold expired for seat {sid}")
                          total += s.price_cents
                      for sid in seat_ids:
                          show.seats[sid].status = SeatStatus.BOOKED
                      return Booking(user_id, list(seat_ids), total)
          ` }),
        h('Extensions'),
        ul("Pricing strategies (weekday matinee, premium seats, dynamic pricing).", "Cancellations and refunds; a background job releasing expired holds so seat maps refresh.", "Payment via a `PaymentProcessor` interface with retries and idempotency keys."),
      ],
    },

    {
      id: 'tic-tac-toe',
      title: 'Design Tic-Tac-Toe',
      body: [
        p("Design a Tic-Tac-Toe game for two players on an `n × n` board. A player wins by filling a whole row, column or diagonal with their mark. It's a compact problem that tests clean modelling and an efficient win check."),
        h('Requirements'),
        ul("Configurable board size `n` (default 3).", "Two players alternate turns; invalid moves are rejected.", "Detect win and draw after each move.", "Easy to add a computer player later."),
        h('Classes'),
        ul("`Player` (name, mark).", "`Board` (n × n cells; place a mark).", "`Game` (players, current turn, status, move validation, win detection)."),
        h('Efficient win detection'),
        p("Scanning the whole board after every move costs $O(n^2)$. Instead keep **counters**: for each row, each column and the two diagonals, add +1 for player X and -1 for player O. A player wins the moment any counter reaches `+n` or `-n`. Each move is then $O(1)$."),
        pre(`
          move X at (1, 1):  rows[1] += 1, cols[1] += 1, diag += 1, anti += 1
          move O at (0, 2):  rows[0] -= 1, cols[2] -= 1, anti -= 1   (0 + 2 == n - 1)
          X wins when |rows[r]|, |cols[c]|, |diag| or |anti| reaches n with sign +
        `),
        h('Implementation'),
        code({ java: `
          enum GameStatus { IN_PROGRESS, X_WINS, O_WINS, DRAW }

          class TicTacToe {
              private final int n;
              private final char[][] board;
              private final int[] rows, cols;
              private int diag, anti, moves;
              private char turn = 'X';
              private GameStatus status = GameStatus.IN_PROGRESS;

              TicTacToe(int n) {
                  this.n = n;
                  board = new char[n][n];
                  rows = new int[n];
                  cols = new int[n];
              }

              GameStatus move(int r, int c) {
                  if (status != GameStatus.IN_PROGRESS) throw new IllegalStateException("Game over");
                  if (r < 0 || r >= n || c < 0 || c >= n || board[r][c] != 0) {
                      throw new IllegalArgumentException("Invalid move");
                  }
                  board[r][c] = turn;
                  int delta = turn == 'X' ? 1 : -1;
                  rows[r] += delta;
                  cols[c] += delta;
                  if (r == c) diag += delta;
                  if (r + c == n - 1) anti += delta;
                  moves++;
                  if (Math.abs(rows[r]) == n || Math.abs(cols[c]) == n || Math.abs(diag) == n || Math.abs(anti) == n) {
                      status = turn == 'X' ? GameStatus.X_WINS : GameStatus.O_WINS;
                  } else if (moves == n * n) {
                      status = GameStatus.DRAW;
                  }
                  turn = turn == 'X' ? 'O' : 'X';
                  return status;
              }
          }
          `, py: `
          from enum import Enum

          class GameStatus(Enum):
              IN_PROGRESS = "in progress"
              X_WINS = "X wins"
              O_WINS = "O wins"
              DRAW = "draw"

          class TicTacToe:
              def __init__(self, n: int = 3):
                  self.n = n
                  self.board = [[None] * n for _ in range(n)]
                  self.rows, self.cols = [0] * n, [0] * n
                  self.diag = self.anti = self.moves = 0
                  self.turn = "X"
                  self.status = GameStatus.IN_PROGRESS

              def move(self, r: int, c: int) -> GameStatus:
                  if self.status is not GameStatus.IN_PROGRESS:
                      raise RuntimeError("Game over")
                  if not (0 <= r < self.n and 0 <= c < self.n) or self.board[r][c] is not None:
                      raise ValueError("Invalid move")
                  self.board[r][c] = self.turn
                  delta = 1 if self.turn == "X" else -1
                  self.rows[r] += delta
                  self.cols[c] += delta
                  if r == c:
                      self.diag += delta
                  if r + c == self.n - 1:
                      self.anti += delta
                  self.moves += 1
                  if self.n in (abs(self.rows[r]), abs(self.cols[c]), abs(self.diag), abs(self.anti)):
                      self.status = GameStatus.X_WINS if self.turn == "X" else GameStatus.O_WINS
                  elif self.moves == self.n * self.n:
                      self.status = GameStatus.DRAW
                  self.turn = "O" if self.turn == "X" else "X"
                  return self.status
          ` }),
        h('Extensions'),
        ul("A `Player` interface with `HumanPlayer` and `ComputerPlayer` (minimax for small boards).", "Undo: keep a move stack and reverse the counter updates.", "Connect-k on larger boards: counters no longer suffice; check runs around the last move instead."),
      ],
    },
  ]);
})();
