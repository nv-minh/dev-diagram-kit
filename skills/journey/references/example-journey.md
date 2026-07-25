# Example journey — first-time buyer, "Online shop"

> A working `journey` block as `/journey` writes it into `srs/{feature}-journey.md`.
> Low ratings (1-2) surface pain points deliberately.

## Journey: First-time buyer

```mermaid
journey
    title Online shopping journey — first-time buyer
    section Discover
      Search product: 5: User
      Compare options: 4: User
    section Buy
      Add to cart: 5: User
      Pay at checkout: 2: User, System
      Payment error retry: 1: User, System
    section After
      Receive confirmation email: 5: User, System
      Track order: 4: User
```
