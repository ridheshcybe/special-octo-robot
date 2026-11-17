# Logic Gates

## Introduction
Logic gates are fundamental building blocks of digital circuits, implementing basic logical operations on binary inputs (0 or 1) to produce a single binary output. They form the basis of all digital systems, including AI/ML hardware accelerators.

## Basic Logic Gates

### AND Gate ($\cdot$ or $∧$)
- Outputs 1 only if all inputs are 1
- Truth table:
  | A | B | Output |
  |---|---|--------|
  | 0 | 0 | 0      |
  | 0 | 1 | 0      |
  | 1 | 0 | 0      |
  | 1 | 1 | 1      |

### OR Gate ($+$ or $∨$)
- Outputs 1 if any input is 1
- Truth table:
  | A | B | Output |
  |---|---|--------|
  | 0 | 0 | 0      |
  | 0 | 1 | 1      |
  | 1 | 0 | 1      |
  | 1 | 1 | 1      |

### NOT Gate ($\overline{}$ or $¬$)
- Inverts input (1 becomes 0, 0 becomes 1)
- Truth table:
  | A | Output |
  |---|--------|
  | 0 | 1      |
  | 1 | 0      |

### XOR Gate ($\oplus$)
- Outputs 1 if inputs differ
- Truth table:
  | A | B | Output |
  |---|---|--------|
  | 0 | 0 | 0      |
  | 0 | 1 | 1      |
  | 1 | 0 | 1      |
  | 1 | 1 | 0      |

## Universal Gates
NAND and NOR gates are universal gates that can implement any Boolean function:
- **NAND Gate**: AND followed by NOT
- **NOR Gate**: OR followed by NOT

## Complex Gates
- **XNOR Gate**: XOR followed by NOT
- **Buffer**: Simple amplification (NOT gate with inverted symbols)
- **Tri-state Buffer**: Output can be high, low, or high-impedance

## Integrated Circuits (ICs)
- **74xx Series**: TTL logic (e.g., 7408 for AND gates)
- **40xx Series**: CMOS logic (e.g., 4081 for AND gates)
- Common packages: Dual-In-Line Package (DIP)

## Worked Example: Implementing a Boolean Expression

**Problem:** Implement $F = A \cdot B + \overline{A} \cdot C$ using only NAND gates.

**Solution:**
1. Convert AND/OR to NAND/NOR using De Morgan's:
   $F = \overline{\overline{A \cdot B} + \overline{\overline{A} \cdot C}}$
2. Steps:
   - Create A' (A NAND A)
   - Create B' (B NAND B)
   - Create C' (C NAND C)
   - Compute $\overline{A \cdot B}$ (A NAND B)
   - Compute $\overline{\overline{A} \cdot C}$ (A' NAND C)
   - Compute $\overline{\overline{A \cdot B} + \overline{\overline{A} \cdot C}}$ (NAND of the two intermediate results)

## Key Takeaways
1. Logic gates process binary inputs (0/1) to produce binary outputs
2. AND/OR/NOT/XOR are basic gates; NAND/NOR are universal gates
3. Boolean algebra underpins logic gate design and simplification
4. Digital circuits are constructed from interconnected logic gates
5. Universal gates can be used to implement any Boolean function

## Exam Practice
1. Convert the Boolean expression $Y = \overline{A} \cdot \overline{(B + C)}$ to an equivalent form using only NAND gates.
2. Draw the truth table for a 3-input XOR gate (A ⊕ B ⊕ C).
3. What is the output of a 2-input NOR gate with inputs A=1, B=0?
4. Implement $Z = A \cdot (B + \overline{C})$ using only NOR gates.
5. Differentiate between a buffer and a NOT gate. When would you use a tri-state buffer in circuit design?
```

*Table: Logic Gate Summary*
| Gate      | Symbol | Boolean Expression | Output (0/1) |
|-----------|--------|--------------------|-------------|
| AND       | ∧      | A·B                | 1 only if A=1, B=1 |
| OR        | ∨      | A+B                | 1 if A=1 or B=1 |
| NOT       | ¬      | $\overline{A}$      | Inverted input |
| NAND      | ⊼      | $\overline{A·B}$     | 0 only if A=1, B=1 |
| NOR       | ↓      | $\overline{A+B}$     | 0 if A=1 or B=1 |
| XOR       | ⊕      | A⊕B                | 1 if inputs differ |
| XNOR      | ⊙      | A⊙B                | 1 if inputs same |