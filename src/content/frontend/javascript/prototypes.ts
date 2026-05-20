import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Prototypes & Inheritance",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "Explain the prototype chain. What does `Object.getPrototypeOf(obj)` return? Explain how `class` syntax relates to prototypal inheritance and what `hasOwnProperty` checks.",
  constraints: [
    "Every object has an internal `[[Prototype]]` link to another object (or `null`).",
    "Property lookup walks up the **prototype chain** until found or `null` is reached.",
    "`class` is **syntactic sugar** over constructor functions and prototype assignment — same mechanism underneath.",
  ],
  explanation: [
    {
      heading: "The prototype chain",
      body: "When you access `obj.prop`, JavaScript first checks `obj` itself. If not found, it checks `obj.__proto__` (the prototype), then the prototype's prototype, and so on — up to `Object.prototype`, then `null`. This chain is what enables **inheritance without classes**.",
      code: `const animal = { breathes: true };
const dog = Object.create(animal); // dog's prototype = animal
dog.bark = true;

console.log(dog.bark);     // true (own property)
console.log(dog.breathes); // true (found on prototype: animal)
console.log(dog.hasOwnProperty('breathes')); // false — inherited`,
    },
    {
      heading: "class is sugar over prototypes",
      body: "ES6 `class` syntax compiles to the same constructor function + prototype pattern. The class body methods are added to `Constructor.prototype`. Instances share methods via the chain — there is no per-instance copy of each method.",
      code: `class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

// Equivalent prototype-based code:
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return \`\${this.name} makes a sound\`;
};

const a = new Animal('Dog');
console.log(Object.getPrototypeOf(a) === Animal.prototype); // true`,
    },
    {
      heading: "hasOwnProperty and the in operator",
      body: "`hasOwnProperty(key)` returns `true` only if the property is **directly on** the object, not inherited. The `in` operator returns `true` for both own and inherited properties. Use `hasOwnProperty` when you only want to iterate own properties (or use `Object.keys()`).",
    },
  ],
  visualizerSteps: [
    {
      description: "Object.create(animal) creates a new object whose [[Prototype]] points to animal. The dog object has only 'bark' as an own property.",
      panels: [
        { title: "dog (own)", color: "#f0db4f", items: [{ label: "bark: true", active: true }] },
        { title: "animal (proto)", color: "#3fb950", items: [{ label: "breathes: true" }] },
        { title: "Object.prototype", color: "#8b949e", items: [{ label: "hasOwnProperty" }, { label: "toString" }] },
      ],
      phase: "chain",
    },
    {
      description: "dog.breathes lookup: not on dog → walk up to animal → found! Returns true.",
      panels: [
        { title: "dog", color: "#f0db4f", items: [{ label: "breathes? ✗", active: true }] },
        { title: "animal", color: "#3fb950", items: [{ label: "breathes: true ✓", active: true }] },
        { title: "result", color: "#8b949e", items: [{ label: "true (from proto)" }] },
      ],
      phase: "lookup",
    },
    {
      description: "class Animal is just sugar. Methods defined in the class body are added to Animal.prototype, not to each instance.",
      panels: [
        { title: "instance a", color: "#f0db4f", items: [{ label: "name: 'Dog'" }] },
        { title: "Animal.prototype", color: "#3fb950", items: [{ label: "speak: fn", active: true }] },
        { title: "chain", color: "#8b949e", items: [{ label: "a.__proto__ === Animal.prototype", active: true }] },
      ],
      phase: "class sugar",
    },
    {
      description: "hasOwnProperty vs 'in': own only vs entire chain.",
      panels: [
        { title: "dog.hasOwnProperty", color: "#f0db4f", items: [{ label: "'bark' → true", active: true }, { label: "'breathes' → false" }] },
        { title: "'in' operator", color: "#3fb950", items: [{ label: "'bark' in dog → true" }, { label: "'breathes' in dog → true", active: true }] },
      ],
      phase: "own vs inherited",
    },
  ],
  solution: `// Prototype chain
const animal = { breathes: true };
const dog = Object.create(animal);
dog.bark = true;
console.log(dog.breathes); // true (from prototype)
console.log(dog.hasOwnProperty('breathes')); // false

// class syntax (sugar over prototypes)
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} speaks\`; }
}
class Dog extends Animal {
  bark() { return 'Woof!'; }
}
const d = new Dog('Rex');
console.log(d.speak()); // Rex speaks
console.log(d.bark());  // Woof!
console.log(Object.getPrototypeOf(d) === Dog.prototype); // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true`,
};
