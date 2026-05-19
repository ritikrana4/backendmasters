export const content = {
  title: "Control Flow",
  sections: [
    {
      heading: "Making Decisions with if/elif/else",
      body: `Control flow lets your program make decisions. The \`if\` statement executes a block of code only when a condition is \`True\`.`,
      code: `temperature = 28\n\nif temperature > 35:\n    print("It's hot!")\nelif temperature > 20:\n    print("Nice weather.")  # This runs\nelse:\n    print("It's cold.")`,
    },
    {
      heading: "Comparison Operators",
      body: `Conditions use comparison operators that return \`True\` or \`False\`:`,
      items: [
        "`==`  equal to",
        "`!=`  not equal to",
        "`>`   greater than",
        "`<`   less than",
        "`>=`  greater than or equal to",
        "`<=`  less than or equal to",
      ],
    },
    {
      heading: "Logical Operators",
      body: `Combine conditions with \`and\`, \`or\`, and \`not\`.`,
      code: `age = 20\nhas_id = True\n\nif age >= 18 and has_id:\n    print("Entry allowed")\n\nif not has_id:\n    print("No ID, no entry")`,
    },
    {
      heading: "The for Loop",
      body: `A \`for\` loop iterates over a sequence — a list, a string, or a \`range()\`.`,
      code: `# Loop over a range of numbers\nfor i in range(5):\n    print(i)   # prints 0, 1, 2, 3, 4\n\n# Loop over a list\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)`,
    },
    {
      heading: "The while Loop",
      body: `A \`while\` loop keeps running as long as its condition stays \`True\`. Always make sure the condition can become \`False\` to avoid an infinite loop.`,
      code: `count = 0\nwhile count < 3:\n    print("Count:", count)\n    count += 1\n# Output: Count: 0, Count: 1, Count: 2`,
    },
    {
      heading: "break and continue",
      body: `\`break\` exits the loop immediately. \`continue\` skips the rest of the current iteration and moves to the next.`,
      code: `for n in range(10):\n    if n == 5:\n        break        # stop at 5\n    if n % 2 == 0:\n        continue     # skip even numbers\n    print(n)         # prints 1, 3`,
    },
  ],
  starterCode: `# Experiment with control flow!
# Try changing the values and see what prints.

score = 75

if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"

print(f"Score: {score}, Grade: {grade}")

# Print only odd numbers from 1 to 10
print("\\nOdd numbers:")
for n in range(1, 11):
    if n % 2 == 0:
        continue
    print(n)
`,
};
