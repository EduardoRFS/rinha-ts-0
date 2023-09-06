import { Var, Binary, Term, Program } from "./ast";

type Env = { [key: string]: Value };
type Closure = {
  parameters: Var[];
  value: Term;
  context: Env;
};
type Value =
  | { kind: "bool"; content: boolean }
  | { kind: "int"; content: number }
  | { kind: "string"; content: string }
  | { kind: "closure"; content: Closure };

const makeBoolean = (content: boolean): Value => ({ kind: "bool", content });
const makeInt = (content: number): Value => ({ kind: "int", content });
const makeString = (content: string): Value => ({ kind: "string", content });
const extractBoolean = (value: Value): boolean => {
  if (value.kind === "bool") {
    return value.content;
  } else if (value.kind === "int") {
    throw new Error("expected a boolean received an int");
  } else if (value.kind === "string") {
    throw new Error("expected a boolean received a string");
  } else if (value.kind === "closure") {
    throw new Error("expected a boolean received a function");
  } else {
    const _: never = value;
    throw new Error("unreachable");
  }
};
const extractInt = (value: Value): number => {
  if (value.kind === "bool") {
    throw new Error("expected an int received a bool");
  } else if (value.kind === "int") {
    return value.content;
  } else if (value.kind === "string") {
    throw new Error("expected an int received a string");
  } else if (value.kind === "closure") {
    throw new Error("expected an int received a function");
  } else {
    const _: never = value;
    throw new Error("unreachable");
  }
};
const extractString = (value: Value): string => {
  if (value.kind === "bool") {
    throw new Error("expected a string received a bool");
  } else if (value.kind === "int") {
    throw new Error("expected a string received an int");
  } else if (value.kind === "string") {
    return value.content;
  } else if (value.kind === "closure") {
    throw new Error("expected an integer received a function");
  } else {
    const _: never = value;
    throw new Error("unreachable");
  }
};
const extractClosure = (value: Value): Closure => {
  if (value.kind === "bool") {
    throw new Error("expected a function received a bool");
  } else if (value.kind === "int") {
    throw new Error("expected a function received an int");
  } else if (value.kind === "string") {
    throw new Error("expected a function received a string");
  } else if (value.kind === "closure") {
    return value.content;
  } else {
    const _: never = value;
    throw new Error("unreachable");
  }
};

const equalValue = (lhs: Value, rhs: Value) => {
  if (lhs.kind === "bool" && rhs.kind === "bool") {
    return lhs.content === rhs.content;
  } else if (lhs.kind === "int" && rhs.kind === "int") {
    return lhs.content === rhs.content;
  } else if (lhs.kind === "string" && rhs.kind === "string") {
    // TODO: interesting optimization
    return lhs.content === rhs.content;
  } else {
    throw new Error(
      `equality between ${lhs.kind} and ${rhs.kind} is not supported`,
    );
  }
};
const evalBinary = (op: Binary, lhs: Value, rhs: Value): Value => {
  if (op === "Concat") {
    const lhsString = extractString(lhs);
    const rhsString = extractString(rhs);
    return makeString(lhsString + rhsString);
  } else if (
    op === "Add" ||
    op === "Sub" ||
    op === "Mul" ||
    op === "Div" ||
    op === "Rem" ||
    op === "Lt" ||
    op === "Gt" ||
    op === "Lte" ||
    op === "Gte"
  ) {
    const lhsInt = extractInt(lhs);
    const rhsInt = extractInt(rhs);
    // TODO: overflow
    if (op === "Add") {
      return makeInt(lhsInt + rhsInt);
    } else if (op === "Sub") {
      return makeInt(lhsInt - rhsInt);
    } else if (op === "Mul") {
      return makeInt(lhsInt * rhsInt);
    } else if (op === "Div") {
      return makeInt(lhsInt / rhsInt);
    } else if (op === "Rem") {
      return makeInt(lhsInt % rhsInt);
    } else if (op === "Lt") {
      return makeBoolean(lhsInt < rhsInt);
    } else if (op === "Gt") {
      return makeBoolean(lhsInt > rhsInt);
    } else if (op === "Lte") {
      return makeBoolean(lhsInt <= rhsInt);
    } else if (op === "Gte") {
      return makeBoolean(lhsInt >= rhsInt);
    } else {
      const _: never = op;
      throw new Error("unreachable");
    }
  } else if (op === "Eq" || op === "Neq") {
    const isEqual = equalValue(lhs, rhs);
    if (op === "Eq") {
      return makeBoolean(isEqual);
    } else if (op === "Neq") {
      return makeBoolean(!isEqual);
    } else {
      const _: never = op;
      throw new Error("unreachable");
    }
  } else if (op === "And" || op === "Or") {
    const lhsBool = extractBoolean(lhs);
    const rhsBool = extractBoolean(rhs);
    if (op === "And") {
      return makeBoolean(lhsBool && rhsBool);
    } else if (op === "Or") {
      return makeBoolean(lhsBool || rhsBool);
    } else {
      const _: never = op;
      throw new Error("unreachable");
    }
  } else {
    const _: never = op;
    throw new Error("unreachable");
  }
};
const evalTerm = (context: Env, term: Term): Value => {
  if (term.kind === "Bool") {
    return { kind: "bool", content: term.value };
  } else if (term.kind === "Int") {
    return { kind: "int", content: term.value };
  } else if (term.kind === "String") {
    return { kind: "string", content: term.value };
  } else if (term.kind === "Function") {
    const content = {
      parameters: term.parameters,
      value: term.value,
      context: context,
    };
    return { kind: "closure", content: content };
  } else if (term.kind === "Var") {
    const value = context[term.text];
    if (value === undefined) {
      throw new Error(`unknown variable ${term.text}`);
    }
    return value;
  } else if (term.kind === "Call") {
    const callee = evalTerm(context, term.callee);
    const args = term.arguments.map((arg) => evalTerm(context, arg));
    const closure = extractClosure(callee);

    // TODO: what happens when there is additional args
    const returnContext = closure.parameters.reduce(
      (context, parameter, index) => {
        const argument = args[index];
        if (argument === undefined) {
          throw new Error("missing argument");
        }
        return { [parameter.text]: argument, ...context };
      },
      closure.context,
    );
    // TODO: tail call optimization
    return evalTerm(returnContext, closure.value);
  } else if (term.kind === "Binary") {
    const lhs = evalTerm(context, term.lhs);
    const rhs = evalTerm(context, term.rhs);
    return evalBinary(term.op, lhs, rhs);
  } else if (term.kind === "Let") {
    const value = evalTerm(context, term.value);
    return evalTerm({ [term.name.text]: value, ...context }, term.next);
  } else if (term.kind === "If") {
    const condition = evalTerm(context, term.condition);
    if (extractBoolean(condition)) {
      return evalTerm(context, term.then);
    } else {
      return evalTerm(context, term.otherwise);
    }
  } else if (term.kind === "Print") {
    const value = evalTerm(context, term.value);
    console.log(extractString(value));
    return value;
  } else {
    const _: never = term;
    throw new Error("unreachable");
  }
};
