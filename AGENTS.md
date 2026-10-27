# Working on this repo (the game-ID rental page)

Notes every assistant working here must read before changing anything.

## Delivery App data: Postgres reads bookings (Phase 5)

The Delivery App backend (`delivery-app-backend-68pm.onrender.com`) is moving its
Booking Log, Customers and Inventory from Google Sheets to Postgres. Live state and
rules: `SHARED-WORKSPACE.md` in the delivery-app repo.

- **From 27/10/2026 after 20:00** bookings are read from Postgres
  (`DATA_SOURCE_BOOKINGS=pg`). Every write still goes to the Google Sheet first and
  then waits for Postgres, so the Booking Log sheet stays complete and current.
- **Nothing changes for this repo:** same API endpoints and responses. Reading the
  Booking Log / Customers / Inventory tabs directly still works.
- **Never write Booking Log, Customers or Inventory into the sheet from here.** Go
  through the Delivery App API. A direct write, or an edit typed into the sheet, reaches
  the app only on the next full pass, up to 5 minutes later.
- A booking that is in the sheet but missing from the app or API for more than
  5 minutes is a bug: log it in delivery-app `SHARED-WORKSPACE.md`. The rollback is
  `DATA_SOURCE_BOOKINGS=dual` on Render.
