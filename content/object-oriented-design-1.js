(function () {
  const { p, h, h3, ul, ol, note, table, talk, flow, code, pre } = K;

  K.chapters('object-oriented-design-interview', [
    {
      id: 'what-is-an-ood-interview',
      title: 'What Is an Object-Oriented Design Interview?',
      body: [
        p("An object-oriented design (OOD) interview, sometimes called *low-level design*, asks you to model a real-world system as **classes, interfaces and their relationships**, and usually to write the core code. Typical prompts: a parking lot, an elevator, a vending machine, a library, a movie booking system, a board game."),
        p("Unlike system design, there are no load balancers or databases to scale. The focus is on **clean abstractions**: responsibilities, extensibility, and code that is easy to read, test and change."),
        h('A step-by-step approach'),
        flow({ nodes: { a: [0, 0, '1. Clarify\nrequirements'], b: [1, 0, '2. Identify\nobjects & use cases'], c: [2, 0, '3. Design classes\n& relationships', 'ml'], d: [3, 0, '4. Write\ncore code'], e: [4, 0, '5. Discuss\nextensions'] },
          edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']], ux: 160, bw: 128 }),
        ol(
          "**Clarify requirements**: who uses the system? Which features are in scope? What are the rules (sizes, pricing, limits)?",
          "**Identify core objects and use cases**: underline the nouns (candidate classes) and verbs (candidate methods) in the requirements.",
          "**Design the classes**: attributes, methods, and relationships (inheritance, composition, association). Sketch a simple class diagram.",
          "**Implement the core**: the classes and the main flows. Interviewers care more about structure and naming than every edge case.",
          "**Extend**: show how the design handles new requirements (a new vehicle type, a new payment method) with minimal changes."
        ),
        h('What interviewers evaluate'),
        table(['Area', 'Signals'], [
          ['Requirements', 'asks good questions; agrees on scope before coding'],
          ['Abstractions', 'sensible classes with single responsibilities; uses interfaces where behaviour varies'],
          ['Principles and patterns', 'applies SOLID and patterns **when they help**, not for show'],
          ['Code quality', 'readable names, encapsulation, no god classes, handles errors'],
          ['Extensibility', 'new features need new classes, not edits everywhere'],
        ]),
        h('Relationships cheat sheet'),
        table(['Relationship', 'Meaning', 'Example'], [
          ['Inheritance (is-a)', 'subclass specialises a base type', '`Car` is a `Vehicle`'],
          ['Interface implementation', 'class fulfils a contract', '`CreditCard` implements `PaymentMethod`'],
          ['Composition (owns, strong)', 'part can\'t exist without the whole', '`ParkingLot` has `Floor`s'],
          ['Aggregation (has, weak)', 'part exists independently', '`Library` has `Member`s'],
          ['Association / dependency', 'uses or refers to', '`Ticket` refers to a `Vehicle`'],
        ]),
        note("Prefer **composition over inheritance**. Inheritance is great for true is-a relationships with shared behaviour, but deep hierarchies are rigid. Behaviour that varies is often better as an interface plus composition (the Strategy pattern)."),
      ],
    },

    {
      id: 'oop-fundamentals-and-solid',
      title: 'OOP Fundamentals and SOLID',
      body: [
        h('The four pillars'),
        table(['Pillar', 'Idea', 'Why it matters'], [
          ['Encapsulation', 'hide internal state; expose behaviour through methods', 'invariants can\'t be broken from outside'],
          ['Abstraction', 'model only what matters; hide complexity behind interfaces', 'callers depend on *what*, not *how*'],
          ['Inheritance', 'reuse and specialise behaviour from a base class', 'shared code, polymorphism'],
          ['Polymorphism', 'one interface, many implementations chosen at runtime', 'add new types without changing callers'],
        ]),
        h('SOLID'),
        h3('S: Single Responsibility Principle'),
        p("A class should have **one reason to change**. An `Invoice` that calculates totals, formats PDFs and sends emails changes for three different reasons; split it into `Invoice`, `InvoicePrinter` and `InvoiceMailer`."),
        h3('O: Open/Closed Principle'),
        p("Classes should be **open for extension, closed for modification**. Adding a new discount type shouldn't require editing a big `if/else` chain; add a new class implementing a `Discount` interface."),
        code({ java: `
          interface Discount {
              double apply(double price);
          }

          class NoDiscount implements Discount {
              public double apply(double price) { return price; }
          }

          class PercentageDiscount implements Discount {
              private final double percent;
              PercentageDiscount(double percent) { this.percent = percent; }
              public double apply(double price) { return price * (1 - percent / 100); }
          }

          class Checkout {
              // New discount types plug in without changing Checkout.
              double total(double price, Discount discount) { return discount.apply(price); }
          }
          `, py: `
          from abc import ABC, abstractmethod

          class Discount(ABC):
              @abstractmethod
              def apply(self, price: float) -> float: ...

          class NoDiscount(Discount):
              def apply(self, price: float) -> float:
                  return price

          class PercentageDiscount(Discount):
              def __init__(self, percent: float):
                  self.percent = percent

              def apply(self, price: float) -> float:
                  return price * (1 - self.percent / 100)

          def total(price: float, discount: Discount) -> float:
              # New discount types plug in without changing this function.
              return discount.apply(price)
          ` }),
        h3('L: Liskov Substitution Principle'),
        p("Subtypes must be usable **anywhere their base type is expected** without breaking behaviour. The classic violation: `Square extends Rectangle`, where setting the width also changes the height, surprising code written for rectangles. If a subclass needs to throw \"not supported\" for a base method, the hierarchy is probably wrong."),
        h3('I: Interface Segregation Principle'),
        p("Prefer **small, focused interfaces**. A `Printer` interface with `print`, `scan` and `fax` forces a simple printer to implement methods it can't support. Split into `Printable`, `Scannable` and `Faxable`."),
        h3('D: Dependency Inversion Principle'),
        p("High-level modules should depend on **abstractions**, not concrete classes. A `NotificationService` should depend on a `MessageSender` interface, with `EmailSender` and `SmsSender` injected, so it's testable and extensible."),
        h('Other guidelines'),
        ul("**DRY**: don't repeat yourself, but don't over-abstract either.", "**YAGNI**: don't build what you don't need yet.", "**Law of Demeter**: talk to your direct collaborators, not their collaborators (`a.getB().getC().doX()` is a smell)."),
      ],
    },

    {
      id: 'design-patterns',
      title: 'Design Patterns You Should Know',
      body: [
        p("Design patterns are named, reusable solutions to recurring design problems. You don't need all 23 classic patterns for interviews; these come up again and again."),
        table(['Pattern', 'Type', 'Problem it solves', 'Interview example'], [
          ['**Singleton**', 'creational', 'exactly one shared instance', 'a `ParkingLot` or configuration (use sparingly; it hurts testability)'],
          ['**Factory**', 'creational', 'create objects without hard-coding concrete classes', '`VehicleFactory.create("truck")`'],
          ['**Builder**', 'creational', 'construct objects with many optional parts', 'a `Pizza` or HTTP request'],
          ['**Strategy**', 'behavioural', 'swap algorithms at runtime', 'pricing, payment methods, elevator scheduling'],
          ['**Observer**', 'behavioural', 'notify many listeners of changes', 'display boards, stock tickers, notifications'],
          ['**State**', 'behavioural', 'behaviour depends on internal state', 'vending machine, order lifecycle, traffic light'],
          ['**Decorator**', 'structural', 'add responsibilities without subclass explosion', 'coffee add-ons, logging around a service'],
          ['**Adapter**', 'structural', 'make an incompatible interface fit', 'wrapping a third-party payment SDK'],
        ]),
        h('Strategy'),
        p("Define a family of algorithms behind one interface and let the client choose. Example: different parking fee strategies."),
        code({ java: `
          interface FeeStrategy {
              double fee(long minutes);
          }

          class HourlyFee implements FeeStrategy {
              public double fee(long minutes) { return Math.ceil(minutes / 60.0) * 3.0; }
          }

          class FlatDailyFee implements FeeStrategy {
              public double fee(long minutes) { return 20.0; }
          }

          class FeeCalculator {
              private FeeStrategy strategy;
              FeeCalculator(FeeStrategy strategy) { this.strategy = strategy; }
              void setStrategy(FeeStrategy strategy) { this.strategy = strategy; }
              double calculate(long minutes) { return strategy.fee(minutes); }
          }
          `, py: `
          import math
          from abc import ABC, abstractmethod

          class FeeStrategy(ABC):
              @abstractmethod
              def fee(self, minutes: int) -> float: ...

          class HourlyFee(FeeStrategy):
              def fee(self, minutes: int) -> float:
                  return math.ceil(minutes / 60) * 3.0

          class FlatDailyFee(FeeStrategy):
              def fee(self, minutes: int) -> float:
                  return 20.0

          class FeeCalculator:
              def __init__(self, strategy: FeeStrategy):
                  self.strategy = strategy

              def calculate(self, minutes: int) -> float:
                  return self.strategy.fee(minutes)
          ` }),
        h('Observer'),
        p("Subjects keep a list of observers and notify them on change, so the subject doesn't need to know what each observer does."),
        code({ java: `
          interface Observer<T> {
              void update(T event);
          }

          class EventBus<T> {
              private final List<Observer<T>> observers = new ArrayList<>();
              void subscribe(Observer<T> o) { observers.add(o); }
              void unsubscribe(Observer<T> o) { observers.remove(o); }
              void publish(T event) {
                  for (Observer<T> o : observers) o.update(event);
              }
          }
          `, py: `
          from typing import Callable, Generic, List, TypeVar

          T = TypeVar("T")

          class EventBus(Generic[T]):
              def __init__(self):
                  self._observers: List[Callable[[T], None]] = []

              def subscribe(self, observer: Callable[[T], None]) -> None:
                  self._observers.append(observer)

              def unsubscribe(self, observer: Callable[[T], None]) -> None:
                  self._observers.remove(observer)

              def publish(self, event: T) -> None:
                  for observer in list(self._observers):
                      observer(event)
          ` }),
        h('Builder'),
        code({ java: `
          class HttpRequest {
              final String url, method, body;
              final Map<String, String> headers;

              private HttpRequest(Builder b) {
                  url = b.url; method = b.method; body = b.body; headers = b.headers;
              }

              static class Builder {
                  private final String url;
                  private String method = "GET", body = "";
                  private final Map<String, String> headers = new HashMap<>();

                  Builder(String url) { this.url = url; }
                  Builder method(String m) { method = m; return this; }
                  Builder header(String k, String v) { headers.put(k, v); return this; }
                  Builder body(String b) { body = b; return this; }
                  HttpRequest build() { return new HttpRequest(this); }
              }
          }
          // new HttpRequest.Builder("https://api.example.com").method("POST").body("{}").build();
          `, py: `
          from dataclasses import dataclass, field
          from typing import Dict

          @dataclass(frozen=True)
          class HttpRequest:
              url: str
              method: str = "GET"
              headers: Dict[str, str] = field(default_factory=dict)
              body: str = ""

          # In Python, keyword arguments with defaults usually replace a Builder:
          req = HttpRequest("https://api.example.com", method="POST", body="{}")
          ` }),
      ],
    },

    {
      id: 'parking-lot',
      title: 'Design a Parking Lot',
      body: [
        p("Design a parking lot system that assigns spots to arriving vehicles, issues tickets, and charges a fee on exit."),
        h('Requirements'),
        talk(['Candidate', 'What vehicle types and spot sizes?'], ['Interviewer', 'Motorcycles, cars and trucks; spots are small, medium and large.'],
          ['Candidate', 'Which vehicles fit which spots?'], ['Interviewer', 'A vehicle can use a spot of its size or larger.'],
          ['Candidate', 'Multiple floors? How is the fee calculated?'], ['Interviewer', 'Several floors. Hourly pricing, but it should be easy to change.'],
          ['Candidate', 'Payment details and entrance hardware?'], ['Interviewer', 'Out of scope. Focus on the core logic.']),
        h('Core objects'),
        ul("`Vehicle` (type, licence plate) and `VehicleSize`.", "`ParkingSpot` (id, size, occupied by).", "`Floor` (list of spots).", "`ParkingLot` (floors, active tickets).", "`Ticket` (id, vehicle, spot, entry time).", "`FeeStrategy` (pricing, swappable)."),
        flow({ nodes: { lot: [1, 0, 'ParkingLot\npark(), unpark()'], floor: [0, 1.2, 'Floor\nfindSpot(size)'], spot: [0, 2.4, 'ParkingSpot\nsize, vehicle'], ticket: [2, 1.2, 'Ticket\nvehicle, spot, entry'], veh: [2, 2.4, 'Vehicle\nplate, size'], fee: [3, 0, 'FeeStrategy\n«interface»', 'ext'] },
          edges: [['lot', 'floor', '1..*'], ['floor', 'spot', '1..*'], ['lot', 'ticket', 'issues'], ['ticket', 'veh'], ['ticket', 'spot'], ['lot', 'fee', 'uses']], ux: 170 }),
        h('Implementation'),
        code({ java: `
          enum VehicleSize { SMALL, MEDIUM, LARGE }

          class Vehicle {
              final String plate;
              final VehicleSize size;
              Vehicle(String plate, VehicleSize size) { this.plate = plate; this.size = size; }
          }

          class ParkingSpot {
              final String id;
              final VehicleSize size;
              private Vehicle vehicle;

              ParkingSpot(String id, VehicleSize size) { this.id = id; this.size = size; }
              boolean isFree() { return vehicle == null; }
              boolean fits(Vehicle v) { return isFree() && v.size.ordinal() <= size.ordinal(); }
              void park(Vehicle v) { vehicle = v; }
              void leave() { vehicle = null; }
          }

          class Floor {
              final List<ParkingSpot> spots = new ArrayList<>();

              Optional<ParkingSpot> findSpot(Vehicle v) {
                  // Prefer the smallest spot that fits, to keep large spots free.
                  return spots.stream().filter(s -> s.fits(v))
                          .min(Comparator.comparingInt(s -> s.size.ordinal()));
              }
          }

          class Ticket {
              final String id;
              final Vehicle vehicle;
              final ParkingSpot spot;
              final long entryMillis;
              Ticket(String id, Vehicle vehicle, ParkingSpot spot, long entryMillis) {
                  this.id = id; this.vehicle = vehicle; this.spot = spot; this.entryMillis = entryMillis;
              }
          }

          interface FeeStrategy { double fee(Ticket ticket, long exitMillis); }

          class HourlyFeeStrategy implements FeeStrategy {
              private final Map<VehicleSize, Double> ratePerHour = Map.of(
                      VehicleSize.SMALL, 1.0, VehicleSize.MEDIUM, 2.5, VehicleSize.LARGE, 5.0);
              public double fee(Ticket t, long exitMillis) {
                  long hours = Math.max(1, (long) Math.ceil((exitMillis - t.entryMillis) / 3_600_000.0));
                  return hours * ratePerHour.get(t.vehicle.size);
              }
          }

          class ParkingLot {
              private final List<Floor> floors;
              private final FeeStrategy feeStrategy;
              private final Map<String, Ticket> active = new HashMap<>();
              private int nextId = 1;

              ParkingLot(List<Floor> floors, FeeStrategy feeStrategy) {
                  this.floors = floors;
                  this.feeStrategy = feeStrategy;
              }

              synchronized Ticket park(Vehicle v, long nowMillis) {
                  for (Floor f : floors) {
                      Optional<ParkingSpot> spot = f.findSpot(v);
                      if (spot.isPresent()) {
                          spot.get().park(v);
                          Ticket t = new Ticket("T" + nextId++, v, spot.get(), nowMillis);
                          active.put(t.id, t);
                          return t;
                      }
                  }
                  throw new IllegalStateException("Lot is full for " + v.size);
              }

              synchronized double unpark(String ticketId, long nowMillis) {
                  Ticket t = active.remove(ticketId);
                  if (t == null) throw new IllegalArgumentException("Unknown ticket " + ticketId);
                  t.spot.leave();
                  return feeStrategy.fee(t, nowMillis);
              }
          }
          `, py: `
          import math
          import threading
          from enum import IntEnum
          from typing import Dict, List, Optional

          class VehicleSize(IntEnum):
              SMALL = 0
              MEDIUM = 1
              LARGE = 2

          class Vehicle:
              def __init__(self, plate: str, size: VehicleSize):
                  self.plate, self.size = plate, size

          class ParkingSpot:
              def __init__(self, spot_id: str, size: VehicleSize):
                  self.id, self.size = spot_id, size
                  self.vehicle: Optional[Vehicle] = None

              def fits(self, v: Vehicle) -> bool:
                  return self.vehicle is None and v.size <= self.size

          class Floor:
              def __init__(self, spots: List[ParkingSpot]):
                  self.spots = spots

              def find_spot(self, v: Vehicle) -> Optional[ParkingSpot]:
                  # Prefer the smallest spot that fits, to keep large spots free.
                  candidates = [s for s in self.spots if s.fits(v)]
                  return min(candidates, key=lambda s: s.size, default=None)

          class Ticket:
              def __init__(self, ticket_id: str, vehicle: Vehicle, spot: ParkingSpot, entry: float):
                  self.id, self.vehicle, self.spot, self.entry = ticket_id, vehicle, spot, entry

          class HourlyFeeStrategy:
              RATES = {VehicleSize.SMALL: 1.0, VehicleSize.MEDIUM: 2.5, VehicleSize.LARGE: 5.0}

              def fee(self, ticket: Ticket, exit_time: float) -> float:
                  hours = max(1, math.ceil((exit_time - ticket.entry) / 3600))
                  return hours * self.RATES[ticket.vehicle.size]

          class ParkingLot:
              def __init__(self, floors: List[Floor], fee_strategy):
                  self.floors = floors
                  self.fee_strategy = fee_strategy
                  self.active: Dict[str, Ticket] = {}
                  self._next_id = 1
                  self._lock = threading.Lock()

              def park(self, v: Vehicle, now: float) -> Ticket:
                  with self._lock:
                      for floor in self.floors:
                          spot = floor.find_spot(v)
                          if spot:
                              spot.vehicle = v
                              ticket = Ticket(f"T{self._next_id}", v, spot, now)
                              self._next_id += 1
                              self.active[ticket.id] = ticket
                              return ticket
                      raise RuntimeError(f"Lot is full for {v.size.name}")

              def unpark(self, ticket_id: str, now: float) -> float:
                  with self._lock:
                      ticket = self.active.pop(ticket_id)
                      ticket.spot.vehicle = None
                      return self.fee_strategy.fee(ticket, now)
          ` }),
        h('Extensions'),
        ul("**Electric charging spots**: a `ChargingSpot` subclass; a car requesting charging filters for it.", "**Different pricing** (weekend, monthly passes): new `FeeStrategy` implementations.", "**Display boards** showing free spots per floor: Observer on spot changes.", "**Concurrency**: the coarse lock is simple; for high throughput, lock per floor or use atomic compare-and-set on spots."),
      ],
    },

    {
      id: 'elevator-system',
      title: 'Design an Elevator System',
      body: [
        p("Design the control system for a bank of elevators in a building: passengers press hall buttons (up/down) on floors and floor buttons inside cars; the system decides which car serves each request and in what order."),
        h('Requirements'),
        ul("N elevators, M floors.", "Hall calls (floor + direction) and car calls (destination floor).", "Each car moves one floor per tick, stops at requested floors, and opens its doors.", "The dispatching algorithm should be swappable.", "Out of scope: weight limits, emergency modes, real hardware."),
        h('Core objects'),
        ul("`Direction` (UP, DOWN, IDLE).", "`Elevator`: current floor, direction, sets of up-stops and down-stops.", "`Dispatcher` (Strategy): picks which elevator serves a hall call.", "`ElevatorSystem`: owns elevators, receives calls, advances time with `step()`."),
        h('Scheduling: the elevator (SCAN) algorithm'),
        p("Each car keeps moving in its current direction while it has stops ahead, then reverses. This is the same idea as the SCAN disk-scheduling algorithm: it avoids starvation and unnecessary direction changes. The dispatcher picks the car with the lowest estimated cost, preferring cars already moving toward the caller in the right direction."),
        h('Implementation'),
        code({ java: `
          enum Direction { UP, DOWN, IDLE }

          class Elevator {
              final int id;
              int floor = 0;
              Direction direction = Direction.IDLE;
              final TreeSet<Integer> upStops = new TreeSet<>();
              final TreeSet<Integer> downStops = new TreeSet<>();

              Elevator(int id) { this.id = id; }

              void addStop(int target) {
                  if (target > floor) upStops.add(target);
                  else if (target < floor) downStops.add(target);
                  if (direction == Direction.IDLE && target != floor) {
                      direction = target > floor ? Direction.UP : Direction.DOWN;
                  }
              }

              /** Move one floor; return true if the doors open at the new floor. */
              boolean step() {
                  if (direction == Direction.UP) floor++;
                  else if (direction == Direction.DOWN) floor--;
                  boolean stop = upStops.remove(floor) | downStops.remove(floor);
                  if (direction == Direction.UP && upStops.isEmpty()) {
                      direction = downStops.isEmpty() ? Direction.IDLE : Direction.DOWN;
                  } else if (direction == Direction.DOWN && downStops.isEmpty()) {
                      direction = upStops.isEmpty() ? Direction.IDLE : Direction.UP;
                  }
                  return stop;
              }

              /** Rough number of floors to travel before reaching target. */
              int cost(int target, Direction wanted) {
                  if (direction == Direction.IDLE) return Math.abs(floor - target);
                  boolean onTheWay = (direction == Direction.UP && target >= floor && wanted != Direction.DOWN)
                          || (direction == Direction.DOWN && target <= floor && wanted != Direction.UP);
                  return onTheWay ? Math.abs(floor - target) : Math.abs(floor - target) + 2 * 50; // penalty
              }
          }

          interface Dispatcher {
              Elevator choose(List<Elevator> elevators, int floor, Direction direction);
          }

          class NearestCarDispatcher implements Dispatcher {
              public Elevator choose(List<Elevator> elevators, int floor, Direction direction) {
                  return elevators.stream().min(Comparator.comparingInt(e -> e.cost(floor, direction))).orElseThrow();
              }
          }

          class ElevatorSystem {
              final List<Elevator> elevators = new ArrayList<>();
              private final Dispatcher dispatcher;

              ElevatorSystem(int count, Dispatcher dispatcher) {
                  for (int i = 0; i < count; i++) elevators.add(new Elevator(i));
                  this.dispatcher = dispatcher;
              }

              void hallCall(int floor, Direction direction) {
                  dispatcher.choose(elevators, floor, direction).addStop(floor);
              }

              void carCall(int elevatorId, int floor) {
                  elevators.get(elevatorId).addStop(floor);
              }

              void step() {
                  for (Elevator e : elevators) e.step();
              }
          }
          `, py: `
          from enum import Enum
          from typing import List

          class Direction(Enum):
              UP = 1
              DOWN = -1
              IDLE = 0

          class Elevator:
              def __init__(self, elevator_id: int):
                  self.id = elevator_id
                  self.floor = 0
                  self.direction = Direction.IDLE
                  self.up_stops: set = set()
                  self.down_stops: set = set()

              def add_stop(self, target: int) -> None:
                  if target > self.floor:
                      self.up_stops.add(target)
                  elif target < self.floor:
                      self.down_stops.add(target)
                  if self.direction is Direction.IDLE and target != self.floor:
                      self.direction = Direction.UP if target > self.floor else Direction.DOWN

              def step(self) -> bool:
                  """Move one floor; return True if the doors open at the new floor."""
                  self.floor += self.direction.value
                  stop = self.floor in self.up_stops or self.floor in self.down_stops
                  self.up_stops.discard(self.floor)
                  self.down_stops.discard(self.floor)
                  if self.direction is Direction.UP and not self.up_stops:
                      self.direction = Direction.DOWN if self.down_stops else Direction.IDLE
                  elif self.direction is Direction.DOWN and not self.down_stops:
                      self.direction = Direction.UP if self.up_stops else Direction.IDLE
                  return stop

              def cost(self, target: int, wanted: Direction) -> int:
                  distance = abs(self.floor - target)
                  if self.direction is Direction.IDLE:
                      return distance
                  on_the_way = ((self.direction is Direction.UP and target >= self.floor and wanted is not Direction.DOWN)
                                or (self.direction is Direction.DOWN and target <= self.floor and wanted is not Direction.UP))
                  return distance if on_the_way else distance + 100   # penalty for turning around

          class NearestCarDispatcher:
              def choose(self, elevators: List[Elevator], floor: int, direction: Direction) -> Elevator:
                  return min(elevators, key=lambda e: e.cost(floor, direction))

          class ElevatorSystem:
              def __init__(self, count: int, dispatcher):
                  self.elevators = [Elevator(i) for i in range(count)]
                  self.dispatcher = dispatcher

              def hall_call(self, floor: int, direction: Direction) -> None:
                  self.dispatcher.choose(self.elevators, floor, direction).add_stop(floor)

              def car_call(self, elevator_id: int, floor: int) -> None:
                  self.elevators[elevator_id].add_stop(floor)

              def step(self) -> None:
                  for e in self.elevators:
                      e.step()
          ` }),
        h('Extensions'),
        ul("Different dispatching strategies for peak hours (e.g. zoning cars to floor ranges).", "Capacity and weight limits; skipping full cars.", "Observers for floor displays and logging.", "Maintenance mode: a `State` per elevator (in service, maintenance, emergency)."),
      ],
    },
  ]);
})();
