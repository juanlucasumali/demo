type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "9f3b5a1c",
    amount: 299.99,
    status: "success",
    email: "john.doe@company.com",
  },
  {
    id: "62a1b3c4",
    amount: 75.50,
    status: "failed",
    email: "sarah@domain.net",
  },
  {
    id: "15d8e4f2",
    amount: 199.99,
    status: "success",
    email: "robert@business.org",
  },
  {
    id: "37c9a8b6",
    amount: 50,
    status: "pending",
    email: "lisa.smith@email.com",
  },
  {
    id: "84f2e1d5",
    amount: 149.99,
    status: "processing",
    email: "mike.jones@work.com",
  },
  {
    id: "23b7c4a9",
    amount: 399.99,
    status: "success",
    email: "emma.wilson@mail.net",
  },
  {
    id: "56d9e2f1",
    amount: 89.99,
    status: "failed",
    email: "david@startup.io",
  },
  {
    id: "91a4c7b3",
    amount: 299,
    status: "processing",
    email: "karen@company.com",
  },
  {
    id: "45e8f2d6",
    amount: 175,
    status: "success",
    email: "peter@business.net",
  },
  {
    id: "78b2a9c4",
    amount: 225.50,
    status: "pending",
    email: "alex@domain.org",
  },
  {
    id: "12d7e3f5",
    amount: 159.99,
    status: "failed",
    email: "rachel@email.com",
  },
  {
    id: "67a1b8c3",
    amount: 445,
    status: "success",
    email: "chris@work.net",
  },
  {
    id: "89f4e2d7",
    amount: 79.99,
    status: "processing",
    email: "jennifer@company.io",
  },
  {
    id: "34h9k2l1",
    amount: 529.99,
    status: "success",
    email: "thomas@tech.co",
  },
  {
    id: "56m4n8p2",
    amount: 89.50,
    status: "pending",
    email: "sophia@startup.com",
  },
  {
    id: "78q2r9s4",
    amount: 299.99,
    status: "failed",
    email: "daniel@business.org",
  },
  {
    id: "91t6u3v8",
    amount: 149.99,
    status: "processing",
    email: "olivia@company.net",
  },
  {
    id: "12w7x4y9",
    amount: 199.50,
    status: "success",
    email: "william@domain.com",
  },
  {
    id: "45z8a2b6",
    amount: 75,
    status: "pending",
    email: "emma@mail.io",
  },
  {
    id: "67c1d5e8",
    amount: 399.99,
    status: "success",
    email: "james@work.com",
  },
  {
    id: "89f4g7h2",
    amount: 129.99,
    status: "failed",
    email: "ava@email.net",
  },
  {
    id: "23i8j1k4",
    amount: 259.99,
    status: "processing",
    email: "noah@business.io",
  },
  {
    id: "56l3m9n7",
    amount: 179.50,
    status: "success",
    email: "isabella@company.org",
  },
  {
    id: "78p2q4r9",
    amount: 89.99,
    status: "pending",
    email: "ethan@domain.net",
  },
  {
    id: "91s6t2u5",
    amount: 449.99,
    status: "success",
    email: "mia@tech.com",
  },
  {
    id: "12v8w3x7",
    amount: 159.99,
    status: "failed",
    email: "alexander@startup.io",
  },
  {
    id: "45y1z4a8",
    amount: 299.99,
    status: "processing",
    email: "charlotte@mail.com",
  },
  {
    id: "67b2c5d9",
    amount: 199.99,
    status: "success",
    email: "benjamin@work.net",
  },
  {
    id: "89e6f1g4",
    amount: 69.99,
    status: "pending",
    email: "amelia@company.com",
  },
  {
    id: "23h9i4j7",
    amount: 549.99,
    status: "success",
    email: "lucas@business.org",
  },
  {
    id: "56k2l7m1",
    amount: 119.99,
    status: "failed",
    email: "harper@domain.io",
  },
  {
    id: "78n5p8q3",
    amount: 289.99,
    status: "processing",
    email: "henry@email.net",
  },
  {
    id: "91r4s7t2",
    amount: 169.50,
    status: "success",
    email: "evelyn@tech.com",
  },
  {
    id: "12u8v3w6",
    amount: 99.99,
    status: "pending",
    email: "sebastian@startup.org",
  },
  {
    id: "45x1y4z8",
    amount: 379.99,
    status: "success",
    email: "scarlett@mail.io",
  },
  {
    id: "67a3b6c9",
    amount: 149.99,
    status: "failed",
    email: "jack@company.net",
  },
  {
    id: "89d4e7f2",
    amount: 259.99,
    status: "processing",
    email: "violet@work.com",
  },
  {
    id: "23g9h2i5",
    amount: 189.50,
    status: "success",
    email: "owen@domain.org",
  }
]