/* More OOD chapters: a framework for the interview, grocery store, shipping lockers, restaurant. */
(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, pre } = K;

  K.chapters('object-oriented-design-interview', [
    {
      id: 'a-framework-for-the-ood-interview',
      title: 'A Framework for the OOD Interview',
      body: [
        p("Object-oriented design interviews reward a calm, repeatable process more than clever tricks. You have 45-60 minutes to turn a one-line prompt (*\"Design a parking lot\"*) into a clear set of classes, relationships and working core code. This framework keeps you on track."),
        h('The steps and a time budget'),
        table(['Step', 'Goal', 'Time (of 45 min)'], [
          ['1. Clarify requirements', 'agree on scope: what the system must do, what it won\'t do', '5-7 min'],
          ['2. Identify core objects', 'find the nouns (classes) and verbs (methods)', '5 min'],
          ['3. Define relationships', 'who owns whom, who knows whom, what inherits from what', '5 min'],
          ['4. Design the interfaces', 'key classes with fields and method signatures; a quick class diagram', '8-10 min'],
          ['5. Implement core flows', 'code the 2-3 most important operations end to end', '15 min'],
          ['6. Discuss extensions', 'new requirements, concurrency, testing, trade-offs', '5 min'],
        ]),
        h('Step 1: clarify requirements'),
        p("Turn the vague prompt into a short, numbered list. Ask about **users and actions**, **variations** (types of things), **rules** (limits, pricing, priorities), and **out-of-scope** items. Write the agreed list where both of you can see it."),
        talk(
          ['Candidate', 'Who uses the system: just customers, or staff too?'],
          ['Interviewer', 'Customers and an admin who configures it.'],
          ['Candidate', 'Should I handle payments, or assume a payment service exists?'],
          ['Interviewer', 'Assume a payment service; just call it.'],
          ['Candidate', 'Is concurrency in scope, for example two customers grabbing the same slot?'],
          ['Interviewer', 'Mention how you\'d handle it, but focus on the object model.']
        ),
        h('Step 2: identify core objects'),
        p("Underline the nouns in your requirements: they're candidate classes. Verbs become methods. Merge duplicates, drop nouns that are just attributes (a *colour* is a field, not a class), and keep the list small: 5-10 core classes is typical."),
        h('Step 3: define relationships'),
        table(['Relationship', 'Meaning', 'Example'], [
          ['Association', 'uses or knows about', 'a `Ticket` refers to a `Vehicle`'],
          ['Aggregation', 'has, but parts can live alone', 'a `Team` has `Player`s'],
          ['Composition', 'owns; parts die with the whole', 'a `ParkingLot` owns its `Floor`s'],
          ['Inheritance', 'is a kind of', '`Car` is a `Vehicle`'],
          ['Interface', 'can do', '`CardPayment` implements `PaymentMethod`'],
        ]),
        p("Prefer **composition over inheritance**: inherit only for a true *is-a* relationship with shared behaviour; otherwise compose and use interfaces."),
        h('Step 4: design interfaces'),
        flow({ nodes: { client: [0, 0, 'Client code', 'client'], facade: [1, 0, 'System facade\nmain operations'], a: [2, -0.6, 'Core entity A'], b: [2, 0.6, 'Core entity B'], strat: [3, 0, 'Strategy\n«interface»', 'ext'] },
          edges: [['client', 'facade', 'calls'], ['facade', 'a', 'owns'], ['facade', 'b', 'owns'], ['a', 'strat', 'delegates']], ux: 170, cap: 'A shape that fits most OOD answers: one entry point, a few entities, behaviour that varies behind an interface' }),
        ul(
          "Start from the **entry point** class the client talks to, and the 2-3 operations it exposes.",
          "Use **enums** for fixed sets (sizes, states, types).",
          "Put behaviour that **varies** behind an interface (pricing rules, allocation strategies, payment methods).",
          "Model **state** explicitly when behaviour depends on it (a vending machine, an order's lifecycle)."
        ),
        h('Patterns that come up again and again'),
        table(['Pattern', 'Use it when', 'Seen in'], [
          ['Strategy', 'an algorithm or rule varies', 'pricing, slot allocation, elevator scheduling'],
          ['State', 'behaviour depends on an object\'s current state', 'vending machine, ATM, orders'],
          ['Observer', 'others must react to an event', 'notifications, displays, kitchen tickets'],
          ['Factory', 'creation logic depends on a type', 'vehicles, documents, notifications'],
          ['Singleton (sparingly)', 'exactly one shared instance', 'a system-wide registry; prefer dependency injection'],
          ['Chain of responsibility', 'a request passes through handlers', 'cash dispensing, request filters'],
        ]),
        h('Step 5: implement core flows'),
        ul("Code the happy path of the most important operations first, then add validation and edge cases.", "Keep classes small and names explicit (`assignLocker`, not `doIt`).", "Inject dependencies such as clocks and payment services so the code is testable."),
        h('Step 6: discuss extensions'),
        ul("**New requirements**: show how one new class or strategy absorbs them without changing old code (open/closed principle).", "**Concurrency**: which operations need locking or atomic updates, and at what granularity.", "**Testing**: what you'd unit test and which dependencies you'd fake.", "**Persistence**: what would be stored, and where state would live in a real system."),
        h('A starter skeleton'),
        p("Most answers begin with the same building blocks: enums for fixed sets, an interface for what varies, and one class that coordinates."),
        code({ java: `
          enum Size { SMALL, MEDIUM, LARGE }

          interface PricingStrategy {
              long priceInCents(Size size, long minutes);
          }

          class FlatRatePricing implements PricingStrategy {
              public long priceInCents(Size size, long minutes) {
                  long perHour = switch (size) { case SMALL -> 200; case MEDIUM -> 300; case LARGE -> 500; };
                  return perHour * ((minutes + 59) / 60); // charge started hours
              }
          }

          class Facility {
              private final PricingStrategy pricing;
              Facility(PricingStrategy pricing) { this.pricing = pricing; }
              long checkout(Size size, long minutes) { return pricing.priceInCents(size, minutes); }
          }
          `, py: `
          from abc import ABC, abstractmethod
          from enum import Enum

          class Size(Enum):
              SMALL = 1
              MEDIUM = 2
              LARGE = 3

          class PricingStrategy(ABC):
              @abstractmethod
              def price_in_cents(self, size: Size, minutes: int) -> int: ...

          class FlatRatePricing(PricingStrategy):
              PER_HOUR = {Size.SMALL: 200, Size.MEDIUM: 300, Size.LARGE: 500}

              def price_in_cents(self, size: Size, minutes: int) -> int:
                  return self.PER_HOUR[size] * ((minutes + 59) // 60)  # charge started hours

          class Facility:
              def __init__(self, pricing: PricingStrategy):
                  self.pricing = pricing

              def checkout(self, size: Size, minutes: int) -> int:
                  return self.pricing.price_in_cents(size, minutes)
          ` }),
        note("Narrate as you go: *\"I'm putting pricing behind an interface because the requirements mentioned weekend rates later.\"* Interviewers grade your reasoning as much as your classes."),
      ],
    },

    {
      id: 'grocery-store-system',
      title: 'Design a Grocery Store System',
      body: [
        p("Design the checkout system of a grocery store: items are scanned at a register, discounts are applied, the customer pays, inventory is updated, and a receipt is printed. Store staff manage the catalog, stock and promotions."),
        h('Requirements'),
        ul(
          "The catalog holds items identified by **barcode**, with a name, category and unit price.",
          "**Inventory** tracks stock per item; checkout must not sell more than is in stock, and low stock should be reported.",
          "A **cart** collects scanned items (scanning the same item twice increases the quantity).",
          "**Discounts** are configurable: a percentage off a category, and *buy X get Y free* on an item. The best combination is computed at checkout.",
          "Payment by cash or card (through a payment service); a **receipt** lists lines, discounts, total and payment.",
          "Out of scope: loyalty points, returns, multiple stores."
        ),
        h('Core objects'),
        table(['Class', 'Responsibility'], [
          ['`Item`', 'barcode, name, category, unit price (in cents)'],
          ['`Catalog`', 'look up items by barcode; staff add or update items'],
          ['`Inventory`', 'stock levels; reserve and commit sales; low-stock alerts'],
          ['`Cart` / `LineItem`', 'items and quantities for one checkout'],
          ['`Discount` (interface)', 'computes the discount it gives a cart; implementations per promotion type'],
          ['`Checkout`', 'orchestrates scanning, pricing, payment and receipts'],
          ['`Receipt`', 'immutable record of what was sold and paid'],
        ]),
        flow({ nodes: { reg: [0, 0, 'Register', 'client'], co: [1.2, 0, 'Checkout'], cart: [1.2, 1.2, 'Cart\nline items'], cat: [2.4, -0.6, 'Catalog'], inv: [2.4, 0.6, 'Inventory', 'db'], disc: [2.4, 1.8, 'Discount\n«interface»', 'ext'], pay: [0, 1.2, 'PaymentService', 'ext'] },
          edges: [['reg', 'co', 'scan, pay'], ['co', 'cat', 'lookup'], ['co', 'inv', 'check / commit'], ['co', 'cart', 'add'], ['cart', 'disc', 'apply'], ['co', 'pay', 'charge']], ux: 165 }),
        h('Design decisions'),
        ul(
          "**Money in integer cents**, never floating point, so totals are exact.",
          "**Strategy pattern for discounts**: each promotion type is a class implementing `Discount`; adding *bundle pricing* later means adding one class.",
          "**Observer for low stock**: `Inventory` notifies listeners (a restock service, a dashboard) when an item drops below its threshold.",
          "**Validate stock at scan time and again at commit time**: another register may have sold the last unit in between."
        ),
        h('Implementation'),
        code({ java: `
          class Item {
              final String barcode, name, category;
              final long priceCents;
              Item(String barcode, String name, String category, long priceCents) {
                  this.barcode = barcode; this.name = name; this.category = category; this.priceCents = priceCents;
              }
          }

          interface Discount {
              String name();
              long amountCents(Map<Item, Integer> lines); // how much this promotion saves
          }

          class CategoryPercentOff implements Discount {
              private final String category; private final int percent;
              CategoryPercentOff(String category, int percent) { this.category = category; this.percent = percent; }
              public String name() { return percent + "% off " + category; }
              public long amountCents(Map<Item, Integer> lines) {
                  long total = 0;
                  for (Map.Entry<Item, Integer> e : lines.entrySet())
                      if (e.getKey().category.equals(category)) total += e.getKey().priceCents * e.getValue();
                  return total * percent / 100;
              }
          }

          class BuyXGetYFree implements Discount {
              private final String barcode; private final int buy, free;
              BuyXGetYFree(String barcode, int buy, int free) { this.barcode = barcode; this.buy = buy; this.free = free; }
              public String name() { return "buy " + buy + " get " + free + " free"; }
              public long amountCents(Map<Item, Integer> lines) {
                  for (Map.Entry<Item, Integer> e : lines.entrySet()) {
                      if (!e.getKey().barcode.equals(barcode)) continue;
                      int groups = e.getValue() / (buy + free); // each full group earns 'free' items
                      return groups * free * e.getKey().priceCents;
                  }
                  return 0;
              }
          }

          class Inventory {
              private final Map<String, Integer> stock = new HashMap<>();
              private final int lowThreshold;
              private final List<String> alerts = new ArrayList<>(); // observer stand-in
              Inventory(int lowThreshold) { this.lowThreshold = lowThreshold; }
              void restock(String barcode, int qty) { stock.merge(barcode, qty, Integer::sum); }
              int available(String barcode) { return stock.getOrDefault(barcode, 0); }
              synchronized void commit(String barcode, int qty) {
                  int left = available(barcode) - qty;
                  if (left < 0) throw new IllegalStateException("out of stock: " + barcode);
                  stock.put(barcode, left);
                  if (left < lowThreshold) alerts.add(barcode);
              }
              List<String> alerts() { return alerts; }
          }

          class Checkout {
              private final Map<String, Item> catalog;
              private final Inventory inventory;
              private final List<Discount> discounts;
              private final Map<Item, Integer> cart = new LinkedHashMap<>();
              Checkout(Map<String, Item> catalog, Inventory inventory, List<Discount> discounts) {
                  this.catalog = catalog; this.inventory = inventory; this.discounts = discounts;
              }
              void scan(String barcode) {
                  Item item = catalog.get(barcode);
                  if (item == null) throw new IllegalArgumentException("unknown barcode " + barcode);
                  if (cart.getOrDefault(item, 0) + 1 > inventory.available(barcode))
                      throw new IllegalStateException("not enough stock for " + item.name);
                  cart.merge(item, 1, Integer::sum);
              }
              long subtotalCents() {
                  long s = 0;
                  for (Map.Entry<Item, Integer> e : cart.entrySet()) s += e.getKey().priceCents * e.getValue();
                  return s;
              }
              long discountCents() {
                  long d = 0;
                  for (Discount discount : discounts) d += discount.amountCents(cart);
                  return Math.min(d, subtotalCents());
              }
              long totalCents() { return subtotalCents() - discountCents(); }
              void pay() { // after a successful charge, commit the sale
                  for (Map.Entry<Item, Integer> e : cart.entrySet()) inventory.commit(e.getKey().barcode, e.getValue());
                  cart.clear();
              }
          }
          `, py: `
          from abc import ABC, abstractmethod
          from dataclasses import dataclass
          from typing import Dict, List

          @dataclass(frozen=True)
          class Item:
              barcode: str
              name: str
              category: str
              price_cents: int

          class Discount(ABC):
              @abstractmethod
              def amount_cents(self, lines: Dict[Item, int]) -> int: ...

          class CategoryPercentOff(Discount):
              def __init__(self, category: str, percent: int):
                  self.category, self.percent = category, percent

              def amount_cents(self, lines: Dict[Item, int]) -> int:
                  total = sum(i.price_cents * q for i, q in lines.items() if i.category == self.category)
                  return total * self.percent // 100

          class BuyXGetYFree(Discount):
              def __init__(self, barcode: str, buy: int, free: int):
                  self.barcode, self.buy, self.free = barcode, buy, free

              def amount_cents(self, lines: Dict[Item, int]) -> int:
                  for item, qty in lines.items():
                      if item.barcode == self.barcode:
                          groups = qty // (self.buy + self.free)  # each full group earns 'free' items
                          return groups * self.free * item.price_cents
                  return 0

          class Inventory:
              def __init__(self, low_threshold: int):
                  self.stock: Dict[str, int] = {}
                  self.low_threshold = low_threshold
                  self.alerts: List[str] = []  # stand-in for observers

              def restock(self, barcode: str, qty: int) -> None:
                  self.stock[barcode] = self.stock.get(barcode, 0) + qty

              def available(self, barcode: str) -> int:
                  return self.stock.get(barcode, 0)

              def commit(self, barcode: str, qty: int) -> None:
                  left = self.available(barcode) - qty
                  if left < 0:
                      raise ValueError('out of stock: ' + barcode)
                  self.stock[barcode] = left
                  if left < self.low_threshold:
                      self.alerts.append(barcode)

          class Checkout:
              def __init__(self, catalog: Dict[str, Item], inventory: Inventory, discounts: List[Discount]):
                  self.catalog, self.inventory, self.discounts = catalog, inventory, discounts
                  self.cart: Dict[Item, int] = {}

              def scan(self, barcode: str) -> None:
                  item = self.catalog[barcode]
                  if self.cart.get(item, 0) + 1 > self.inventory.available(barcode):
                      raise ValueError('not enough stock for ' + item.name)
                  self.cart[item] = self.cart.get(item, 0) + 1

              def subtotal_cents(self) -> int:
                  return sum(i.price_cents * q for i, q in self.cart.items())

              def discount_cents(self) -> int:
                  return min(sum(d.amount_cents(self.cart) for d in self.discounts), self.subtotal_cents())

              def total_cents(self) -> int:
                  return self.subtotal_cents() - self.discount_cents()

              def pay(self) -> None:  # after a successful charge, commit the sale
                  for item, qty in self.cart.items():
                      self.inventory.commit(item.barcode, qty)
                  self.cart.clear()
          ` }),
        h('Extensions'),
        ul(
          "**Best-deal selection**: if promotions can't stack, evaluate each combination (or a priority order) and apply the one that saves the most.",
          "**Weighted items** (fruit by the kilo): add a `PricingUnit` to `Item` and a scale reading at scan time.",
          "**Returns**: a `Return` references the original `Receipt` and restocks the items.",
          "**Concurrency across registers**: commit stock with an atomic decrement in the database; the scan-time check is only a friendly early warning."
        ),
      ],
    },

    {
      id: 'shipping-locker-system',
      title: 'Design a Shipping Locker System',
      body: [
        p("Design a self-service parcel locker station: a courier drops off a package in a locker, the customer receives a one-time code, and picks the package up within a few days. Packages that aren't collected in time are returned."),
        h('Requirements'),
        ul(
          "A station has lockers of three sizes: **small, medium and large**.",
          "On drop-off, assign the **smallest free locker** that fits the package; fail clearly if none fits.",
          "Generate a **unique pickup code** per delivery and notify the customer.",
          "Pickup with the correct code opens the locker and frees it. Wrong codes are rejected.",
          "Packages not collected within **3 days** expire: the locker is flagged for the courier to retrieve the package.",
          "Out of scope: payments, multiple stations' routing, hardware drivers (assume an `open(locker)` call)."
        ),
        h('Core objects'),
        table(['Class', 'Responsibility'], [
          ['`Size` (enum)', 'SMALL < MEDIUM < LARGE, with a `fits` check'],
          ['`Locker`', 'id, size, current package (or empty)'],
          ['`Package`', 'id, size, recipient contact'],
          ['`Delivery`', 'package, locker, code, deposit time, status'],
          ['`LockerStation`', 'assigns lockers, issues codes, handles pickups and expirations'],
          ['`Clock` and `Notifier`', 'injected so time and messages can be faked in tests'],
        ]),
        flow({ nodes: { courier: [0, 0, 'Courier', 'client'], cust: [0, 1.3, 'Customer', 'client'], st: [1.3, 0.65, 'LockerStation\nassign, pickup, expire'], lk: [2.6, 0, 'Lockers by size', 'store'], dl: [2.6, 1.3, 'Active deliveries\ncode → delivery', 'db'], nt: [1.3, 2, 'Notifier', 'ext'] },
          edges: [['courier', 'st', 'drop off'], ['cust', 'st', 'code'], ['st', 'lk', 'claim / free'], ['st', 'dl', 'record'], ['st', 'nt', 'send code']], ux: 160 }),
        h('Design decisions'),
        ul(
          "**Smallest fitting locker** keeps large lockers free for large parcels. Keep a free list per size, so allocation is $O(1)$ per size.",
          "**Codes** are random, never sequential, and unique among active deliveries; store them in a map for $O(1)$ lookup.",
          "**Time is injected** (`Clock`) so expiry rules are testable.",
          "**State per delivery** (`STORED → PICKED_UP` or `STORED → EXPIRED`) makes the lifecycle explicit."
        ),
        h('Implementation'),
        code({ java: `
          enum Size {
              SMALL, MEDIUM, LARGE;
              boolean fits(Size pkg) { return pkg.ordinal() <= ordinal(); }
          }

          class Locker {
              final String id; final Size size;
              Locker(String id, Size size) { this.id = id; this.size = size; }
          }

          class Delivery {
              enum Status { STORED, PICKED_UP, EXPIRED }
              final String packageId, code; final Locker locker; final long depositedAt;
              Status status = Status.STORED;
              Delivery(String packageId, Locker locker, String code, long depositedAt) {
                  this.packageId = packageId; this.locker = locker; this.code = code; this.depositedAt = depositedAt;
              }
          }

          class LockerStation {
              static final long MAX_AGE_MS = 3L * 24 * 60 * 60 * 1000; // 3 days
              private final Map<Size, Deque<Locker>> free = new EnumMap<>(Size.class);
              private final Map<String, Delivery> byCode = new HashMap<>();
              private final Random random;

              LockerStation(List<Locker> lockers, Random random) {
                  for (Size s : Size.values()) free.put(s, new ArrayDeque<>());
                  for (Locker l : lockers) free.get(l.size).add(l);
                  this.random = random;
              }

              /** Store a package in the smallest free locker that fits; returns the pickup code. */
              synchronized String dropOff(String packageId, Size pkgSize, long now) {
                  for (Size s : Size.values()) {
                      if (!s.fits(pkgSize) || free.get(s).isEmpty()) continue;
                      Locker locker = free.get(s).poll();
                      String code;
                      do { code = String.format("%06d", random.nextInt(1_000_000)); } while (byCode.containsKey(code));
                      byCode.put(code, new Delivery(packageId, locker, code, now));
                      return code;
                  }
                  throw new IllegalStateException("no free locker fits " + pkgSize);
              }

              /** Returns the locker to open, or null for a wrong or expired code. */
              synchronized Locker pickUp(String code, long now) {
                  Delivery d = byCode.get(code);
                  if (d == null || d.status != Delivery.Status.STORED || now - d.depositedAt > MAX_AGE_MS) return null;
                  d.status = Delivery.Status.PICKED_UP;
                  byCode.remove(code);
                  free.get(d.locker.size).add(d.locker);
                  return d.locker;
              }

              /** Mark overdue deliveries expired; returns lockers the courier must empty. */
              synchronized List<Locker> expire(long now) {
                  List<Locker> toEmpty = new ArrayList<>();
                  for (Iterator<Delivery> it = byCode.values().iterator(); it.hasNext(); ) {
                      Delivery d = it.next();
                      if (now - d.depositedAt > MAX_AGE_MS) {
                          d.status = Delivery.Status.EXPIRED;
                          toEmpty.add(d.locker);
                          it.remove();
                      }
                  }
                  return toEmpty;
              }

              synchronized void lockerEmptied(Locker locker) { free.get(locker.size).add(locker); }
          }
          `, py: `
          import random
          from collections import deque
          from enum import IntEnum
          from typing import Dict, List, Optional

          MAX_AGE = 3 * 24 * 60 * 60  # seconds

          class Size(IntEnum):
              SMALL = 1
              MEDIUM = 2
              LARGE = 3

          class Locker:
              def __init__(self, locker_id: str, size: Size):
                  self.id, self.size = locker_id, size

          class Delivery:
              def __init__(self, package_id: str, locker: Locker, code: str, deposited_at: float):
                  self.package_id, self.locker, self.code = package_id, locker, code
                  self.deposited_at = deposited_at
                  self.status = 'STORED'

          class LockerStation:
              def __init__(self, lockers: List[Locker], rng: random.Random):
                  self.free = {s: deque() for s in Size}
                  for locker in lockers:
                      self.free[locker.size].append(locker)
                  self.by_code: Dict[str, Delivery] = {}
                  self.rng = rng

              def drop_off(self, package_id: str, size: Size, now: float) -> str:
                  for s in Size:  # smallest first
                      if s >= size and self.free[s]:
                          locker = self.free[s].popleft()
                          code = self._new_code()
                          self.by_code[code] = Delivery(package_id, locker, code, now)
                          return code
                  raise ValueError('no free locker fits ' + size.name)

              def pick_up(self, code: str, now: float) -> Optional[Locker]:
                  d = self.by_code.get(code)
                  if d is None or now - d.deposited_at > MAX_AGE:
                      return None  # wrong or expired code
                  d.status = 'PICKED_UP'
                  del self.by_code[code]
                  self.free[d.locker.size].append(d.locker)
                  return d.locker

              def expire(self, now: float) -> List[Locker]:
                  overdue = [c for c, d in self.by_code.items() if now - d.deposited_at > MAX_AGE]
                  lockers = []
                  for code in overdue:
                      d = self.by_code.pop(code)
                      d.status = 'EXPIRED'
                      lockers.append(d.locker)  # the courier empties it, then calls locker_emptied
                  return lockers

              def locker_emptied(self, locker: Locker) -> None:
                  self.free[locker.size].append(locker)

              def _new_code(self) -> str:
                  while True:
                      code = '%06d' % self.rng.randrange(1_000_000)
                      if code not in self.by_code:
                          return code
          ` }),
        h('Extensions'),
        ul(
          "**Several stations**: a `LockerNetwork` picks the nearest station with a fitting locker; each station still allocates locally.",
          "**Reservations**: let the courier reserve a locker when the route is planned, with a short hold time.",
          "**Brute-force protection**: lock the keypad after several wrong codes.",
          "**Persistence**: lockers and deliveries live in a database; the free-locker update and the delivery insert must happen in one transaction."
        ),
      ],
    },

    {
      id: 'restaurant-management-system',
      title: 'Design a Restaurant Management System',
      body: [
        p("Design the core of a restaurant management system: guests reserve or walk in, are seated at tables, order from the menu, the kitchen prepares orders in sequence, and the bill is split and paid."),
        h('Requirements'),
        ul(
          "Tables have a **capacity**; reservations book a table for a time slot (say 90 minutes) and must not overlap.",
          "Walk-ins get the **smallest free table** that fits the party.",
          "Waiters create **orders** for a table from the **menu**; items go to the **kitchen**, which works first-come, first-served and tells the waiter when an order is ready.",
          "The **bill** totals the table's orders, adds tax, and can be split evenly between guests.",
          "Out of scope: staff scheduling, inventory, loyalty programmes."
        ),
        h('Core objects'),
        table(['Class', 'Responsibility'], [
          ['`Table`', 'id, capacity, status (free / occupied)'],
          ['`Reservation`', 'table, party size, start time, guest name'],
          ['`MenuItem`', 'name, price in cents, category'],
          ['`Order` / `OrderLine`', 'items ordered for a table, with status'],
          ['`Kitchen`', 'queue of order tickets; notifies listeners when an order is ready (observer)'],
          ['`Bill`', 'computes subtotal, tax and per-guest split'],
          ['`Restaurant`', 'facade: reserve, seat, order, close the bill'],
        ]),
        flow({ nodes: { host: [0, 0, 'Host / waiter', 'client'], r: [1.3, 0, 'Restaurant\nfacade'], t: [2.6, -0.6, 'Tables +\nreservations', 'db'], o: [2.6, 0.6, 'Orders'], k: [1.3, 1.4, 'Kitchen\nticket queue', 'queue'], b: [2.6, 1.8, 'Bill'] },
          edges: [['host', 'r', 'reserve, seat, order'], ['r', 't'], ['r', 'o'], ['o', 'k', 'ticket'], ['k', 'host', 'order ready', 'dash'], ['r', 'b', 'close table']], ux: 160 }),
        h('Design decisions'),
        ul(
          "**Reservation conflicts** are interval overlaps: two bookings of a table clash when `start1 < end2 and start2 < end1`.",
          "**Observer** for kitchen updates: waiters subscribe to *order ready* events instead of polling the kitchen.",
          "**Money in cents** and tax computed once on the subtotal, rounded half up.",
          "Splitting a bill evenly must hand out the leftover cents so the parts add up to the total exactly."
        ),
        h('Implementation'),
        code({ java: `
          class Table {
              final int id, capacity;
              boolean occupied;
              Table(int id, int capacity) { this.id = id; this.capacity = capacity; }
          }

          class Reservation {
              static final long SLOT_MINUTES = 90;
              final Table table; final int partySize; final long startMinute; final String guest;
              Reservation(Table table, int partySize, long startMinute, String guest) {
                  this.table = table; this.partySize = partySize; this.startMinute = startMinute; this.guest = guest;
              }
              boolean overlaps(long otherStart) {
                  return startMinute < otherStart + SLOT_MINUTES && otherStart < startMinute + SLOT_MINUTES;
              }
          }

          class MenuItem {
              final String name; final long priceCents;
              MenuItem(String name, long priceCents) { this.name = name; this.priceCents = priceCents; }
          }

          class Order {
              private static int nextId = 1;
              final int id = nextId++; final Table table; final List<MenuItem> items = new ArrayList<>();
              Order(Table table) { this.table = table; }
              long totalCents() { long t = 0; for (MenuItem m : items) t += m.priceCents; return t; }
          }

          interface OrderListener { void orderReady(Order order); }

          class Kitchen {
              private final Deque<Order> queue = new ArrayDeque<>();
              private final List<OrderListener> listeners = new ArrayList<>();
              void subscribe(OrderListener l) { listeners.add(l); }
              void submit(Order order) { queue.add(order); }
              Order finishNext() { // the chef completes the oldest ticket
                  Order done = queue.poll();
                  if (done != null) for (OrderListener l : listeners) l.orderReady(done);
                  return done;
              }
          }

          class Restaurant {
              private final List<Table> tables;
              private final List<Reservation> reservations = new ArrayList<>();
              final Kitchen kitchen = new Kitchen();
              Restaurant(List<Table> tables) {
                  this.tables = new ArrayList<>(tables);
                  this.tables.sort(Comparator.comparingInt(t -> t.capacity)); // smallest first
              }

              Reservation reserve(int partySize, long startMinute, String guest) {
                  for (Table t : tables) {
                      if (t.capacity < partySize) continue;
                      boolean clash = false;
                      for (Reservation r : reservations) if (r.table == t && r.overlaps(startMinute)) clash = true;
                      if (!clash) {
                          Reservation r = new Reservation(t, partySize, startMinute, guest);
                          reservations.add(r);
                          return r;
                      }
                  }
                  return null; // fully booked for that slot
              }

              Table seatWalkIn(int partySize) {
                  for (Table t : tables) if (!t.occupied && t.capacity >= partySize) { t.occupied = true; return t; }
                  return null;
              }

              static long[] splitBill(long subtotalCents, int taxPercent, int guests) {
                  long total = subtotalCents + (subtotalCents * taxPercent + 50) / 100; // tax rounded half up
                  long[] parts = new long[guests];
                  for (int i = 0; i < guests; i++) parts[i] = total / guests + (i < total % guests ? 1 : 0);
                  return parts; // parts always add up to the total
              }
          }
          `, py: `
          from collections import deque
          from typing import Callable, List, Optional

          SLOT_MINUTES = 90

          class Table:
              def __init__(self, table_id: int, capacity: int):
                  self.id, self.capacity, self.occupied = table_id, capacity, False

          class Reservation:
              def __init__(self, table: Table, party_size: int, start: int, guest: str):
                  self.table, self.party_size, self.start, self.guest = table, party_size, start, guest

              def overlaps(self, other_start: int) -> bool:
                  return self.start < other_start + SLOT_MINUTES and other_start < self.start + SLOT_MINUTES

          class MenuItem:
              def __init__(self, name: str, price_cents: int):
                  self.name, self.price_cents = name, price_cents

          class Order:
              def __init__(self, table: Table):
                  self.table, self.items = table, []

              def total_cents(self) -> int:
                  return sum(item.price_cents for item in self.items)

          class Kitchen:
              def __init__(self):
                  self.queue = deque()
                  self.listeners: List[Callable[[Order], None]] = []

              def subscribe(self, listener: Callable[[Order], None]) -> None:
                  self.listeners.append(listener)

              def submit(self, order: Order) -> None:
                  self.queue.append(order)

              def finish_next(self) -> Optional[Order]:  # the chef completes the oldest ticket
                  if not self.queue:
                      return None
                  order = self.queue.popleft()
                  for listener in self.listeners:
                      listener(order)
                  return order

          class Restaurant:
              def __init__(self, tables: List[Table]):
                  self.tables = sorted(tables, key=lambda t: t.capacity)  # smallest first
                  self.reservations: List[Reservation] = []
                  self.kitchen = Kitchen()

              def reserve(self, party_size: int, start: int, guest: str) -> Optional[Reservation]:
                  for t in self.tables:
                      if t.capacity >= party_size and not any(
                              r.table is t and r.overlaps(start) for r in self.reservations):
                          r = Reservation(t, party_size, start, guest)
                          self.reservations.append(r)
                          return r
                  return None  # fully booked for that slot

              def seat_walk_in(self, party_size: int) -> Optional[Table]:
                  for t in self.tables:
                      if not t.occupied and t.capacity >= party_size:
                          t.occupied = True
                          return t
                  return None

              @staticmethod
              def split_bill(subtotal_cents: int, tax_percent: int, guests: int) -> List[int]:
                  total = subtotal_cents + (subtotal_cents * tax_percent + 50) // 100  # tax rounded half up
                  base, extra = divmod(total, guests)
                  return [base + (1 if i < extra else 0) for i in range(guests)]  # parts add up exactly
          ` }),
        h('Extensions'),
        ul(
          "**Kitchen stations**: route items to grill, salad or dessert queues; an order is ready when all its items are.",
          "**Priorities**: a priority queue lets the kitchen fast-track items like children's meals.",
          "**Table merging** for large parties: a `TableGroup` composite with the combined capacity.",
          "**Uneven splits**: assign order lines to guests and compute each guest's share of tax and tip proportionally."
        ),
      ],
    },
  ]);

  K.orderChapters('object-oriented-design-interview', [
    'what-is-an-ood-interview', 'a-framework-for-the-ood-interview', 'oop-fundamentals-and-solid', 'design-patterns',
    'parking-lot', 'movie-ticket-booking', 'unix-file-search', 'vending-machine', 'elevator-system',
    'grocery-store-system', 'tic-tac-toe', 'blackjack-card-game', 'shipping-locker-system', 'atm-system',
    'restaurant-management-system', 'library-management-system',
  ]);
})();
