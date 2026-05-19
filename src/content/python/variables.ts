export const content = {
  title: "Variables & Data Types",
  sections: [
    {
      heading: "What is a Variable?",
      body: `A variable is a named container that holds a value. In Python, you don't need to declare a type — Python figures it out from the value you assign.`,
    },
    {
      heading: "Assigning Variables",
      body: `Use the \`=\` operator to assign a value to a variable name.`,
      code: `name = "Alice"\nage = 30\nheight = 1.75\nis_student = True\n\nprint(name)      # Alice\nprint(age)       # 30\nprint(height)    # 1.75\nprint(is_student)# True`,
    },
    {
      heading: "Core Data Types",
      body: `Python has four built-in primitive types you'll use constantly:`,
      items: [
        "`str` — Text, wrapped in single or double quotes: `\"hello\"` or `'world'`",
        "`int` — Whole numbers: `42`, `-7`, `0`",
        "`float` — Decimal numbers: `3.14`, `-0.5`",
        "`bool` — Logical values: `True` or `False`",
      ],
    },
    {
      heading: "Checking the Type",
      body: `Use the built-in \`type()\` function to inspect what type a variable holds.`,
      code: `x = 42\nprint(type(x))    # <class 'int'>\n\ny = "hello"\nprint(type(y))    # <class 'str'>\n\nz = 3.14\nprint(type(z))    # <class 'float'>`,
    },
    {
      heading: "Type Conversion",
      body: `You can convert between types using \`int()\`, \`float()\`, \`str()\`, and \`bool()\`.`,
      code: `age_str = "25"\nage_int = int(age_str)\nprint(age_int + 5)    # 30\n\nprice = 9.99\nprint(int(price))     # 9  (truncates, not rounds)\n\nprint(str(100))       # "100"`,
    },
  ],
  starterCode: `# Try it yourself!
# Create variables of each type and print them

name = "Your Name"
age = 0
height = 0.0
is_learning = True

print("Name:", name)
print("Age:", age)
print("Height:", height)
print("Learning Python:", is_learning)
print("Type of age:", type(age))
`,
};
