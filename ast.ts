export type Loc = {
  start: number;
  end: number;
  filename: string;
};
export type Binary =
  | "Concat" // Concatenate, +
  | "Add" // Add, +
  | "Sub" // Subtract, -
  | "Mul" // Multiply, *
  | "Div" // Divide, /
  | "Rem" // Rem, %
  | "Eq" // Equal, ==
  | "Neq" // Not equal, !=
  | "Lt" // Less than, <
  | "Gt" // Greater than, >
  | "Lte" // Less than or equal to, <=
  | "Gte" // Greater than or equal to, =>
  | "And" // And, &&
  | "Or"; // Or, ||

export type Var = {
  text: string;
  location: Loc;
};
export type Term =
  | {
      // Literal Bool, true
      kind: "Bool";
      value: boolean;
      location: Loc;
    }
  | {
      // Literal Int32, 123
      kind: "Int";
      value: number;
      location: Loc;
    }
  | {
      // Literal String, "abc"
      kind: "String";
      value: string;
      location: Loc;
    }
  | {
      // Variable, x
      kind: "Var";
      text: string;
      location: Loc;
    }
  | {
      // Function Expression, fn (x, y) => value
      kind: "Function";
      parameters: Var[];
      value: Term;
      location: Loc;
    }
  | {
      // Function Call, callee(arg, 1, "b")
      kind: "Call";
      callee: Term;
      arguments: Term[];
      location: Loc;
    }
  | {
      // Binary Operation, lhs + rhs
      kind: "Binary";
      lhs: Term;
      op: Binary;
      rhs: Term;
      location: Loc;
    }
  | {
      // Let Expression, let x = value; next
      kind: "Let";
      name: Var;
      value: Term;
      next: Term;
      location: Loc;
    }
  | {
      // If Expression, if (condition) { then } else { otherwise }
      kind: "If";
      condition: Term;
      then: Term;
      otherwise: Term;
      location: Loc;
    }
  | {
      // Print, print("a")
      kind: "Print";
      value: Term;
      location: Loc;
    };
export type Program = {
  name: String;
  expression: Term;
  location: Loc;
};
