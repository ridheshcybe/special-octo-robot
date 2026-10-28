/**
 * Comprehensive Verified LaTeX & Markdown Study Notes Library
 * Aligned with DYPIU Semester 1 Curriculum (AY 2026-27).
 * School of Computer Science, Engineering & Applications.
 * Contains high-yield exam derivations, solved numericals, worked assignments, and lab manuals.
 */

export const TOPIC_LATEX_LIBRARY: Record<string, string> = {
  // ==========================================
  // CSE1001: APPLIED COMPUTATIONAL MATHEMATICS
  // ==========================================
  "matrices-matrix-operations": `### 1. Matrix Algebra Fundamentals
A matrix $A \in \mathbb{R}^{m \times n}$ is a rectangular array of numbers arranged in $m$ rows and $n$ columns.
- **Matrix Multiplication:** For $A \in \mathbb{R}^{m \times k}$ and $B \in \mathbb{R}^{k \times n}$, the product $C = AB \in \mathbb{R}^{m \times n}$ has entries:
  $$c_{ij} = \sum_{p=1}^{k} a_{ip} b_{pj}$$
- **Transpose Properties:**
  $$(AB)^T = B^T A^T, \quad (A+B)^T = A^T + B^T, \quad (A^T)^T = A$$
- **Symmetric & Skew-Symmetric:**
  - Symmetric: $A^T = A$
  - Skew-Symmetric: $A^T = -A$ (all diagonal entries $a_{ii} = 0$)
  - Any square matrix $A$ can be uniquely expressed as:
    $$A = \frac{1}{2}(A + A^T) + \frac{1}{2}(A - A^T)$$
    *(Sum of a symmetric matrix and a skew-symmetric matrix).*

---

### 2. Orthogonal & Unitary Matrices
A real square matrix $Q \in \mathbb{R}^{n \times n}$ is **orthogonal** if:
$$Q^T Q = Q Q^T = I_n \iff Q^{-1} = Q^T$$
- $\det(Q) = \pm 1$.
- Preserves vector lengths and inner products: $\|Q \mathbf{x}\| = \|\mathbf{x}\|$.
- In complex matrices, $U^* U = I$ defines a **unitary matrix** ($U^{-1} = U^*$).

---

### 3. Solved University Numerical
**Problem:** Express $A = \begin{bmatrix} 3 & 5 \\ 1 & -1 \end{bmatrix}$ as the sum of a symmetric and skew-symmetric matrix.
1. Symmetric part $P = \frac{1}{2}(A + A^T)$:
   $$P = \frac{1}{2} \left( \begin{bmatrix} 3 & 5 \\ 1 & -1 \end{bmatrix} + \begin{bmatrix} 3 & 1 \\ 5 & -1 \end{bmatrix} \right) = \begin{bmatrix} 3 & 3 \\ 3 & -1 \end{bmatrix}$$
2. Skew-symmetric part $Q = \frac{1}{2}(A - A^T)$:
   $$Q = \frac{1}{2} \left( \begin{bmatrix} 3 & 5 \\ 1 & -1 \end{bmatrix} - \begin{bmatrix} 3 & 1 \\ 5 & -1 \end{bmatrix} \right) = \begin{bmatrix} 0 & 2 \\ -2 & 0 \end{bmatrix}$$
3. Verification: $P + Q = \begin{bmatrix} 3 & 5 \\ 1 & -1 \end{bmatrix} = A$.`,

  "elementary-row-operations": `### 1. Elementary Row Operations (ERO)
On any matrix $A \in \mathbb{R}^{m \times n}$, three elementary operations preserve row equivalence ($A \sim B$):
1. **$R_i \leftrightarrow R_j$**: Interchange of rows $i$ and $j$.
2. **$R_i \to k R_i$** ($k \neq 0$): Multiplication of row $i$ by a non-zero scalar $k$.
3. **$R_i \to R_i + k R_j$**: Adding $k$ times row $j$ to row $i$.

---

### 2. Row Echelon Form (REF) & Reduced Row Echelon Form (RREF)
A matrix is in **Row Echelon Form (REF)** if:
- All zero rows are at the bottom.
- The leading entry (pivot) of a non-zero row is strictly to the right of the leading entry of the row above it.
- All entries below a leading pivot are zero.

In **RREF**, every leading pivot is $1$, and each pivot is the only non-zero entry in its entire column.

$$\text{Rank } \rho(A) = \text{Number of non-zero rows in REF}$$

---

### 3. Step-by-Step Reduction to REF
Reduce $A = \begin{bmatrix} 1 & 2 & -1 & 3 \\ 2 & 4 & 1 & -2 \\ 3 & 6 & 3 & -7 \end{bmatrix}$ to echelon form:
$$R_2 \to R_2 - 2R_1, \quad R_3 \to R_3 - 3R_1$$
$$\begin{bmatrix} 1 & 2 & -1 & 3 \\ 0 & 0 & 3 & -8 \\ 0 & 0 & 6 & -16 \end{bmatrix} \\xrightarrow{R_3 \to R_3 - 2R_2} \begin{bmatrix} 1 & 2 & -1 & 3 \\ 0 & 0 & 3 & -8 \\ 0 & 0 & 0 & 0 \end{bmatrix}$$
There are $2$ non-zero rows, hence $\rho(A) = 2$.`,

  "vector-spaces-subspaces": `### 1. Vector Space & Subspace Axioms
Let $V$ be a vector space over field $\mathbb{R}$. A non-empty subset $W \subseteq V$ is a **subspace** iff:
$$\forall \mathbf{u}, \mathbf{v} \in W, \; \forall \alpha, \beta \in \mathbb{R} \implies \alpha \mathbf{u} + \beta \mathbf{v} \in W$$

---

### 2. Linear Independence & Basis
A set $\{\mathbf{v}_1, \mathbf{v}_2, \dots, \mathbf{v}_k\}$ is **linearly independent** if:
$$c_1 \mathbf{v}_1 + c_2 \mathbf{v}_2 + \dots + c_k \mathbf{v}_k = \mathbf{0} \implies c_1 = c_2 = \dots = c_k = 0$$

- A **basis** of $V$ is a linearly independent spanning set.
- The **dimension** $\dim(V)$ is the number of vectors in any basis.

---

### 3. Rank-Nullity Theorem (High-Yield Exam Proof)
For any linear transformation $T: \mathbb{R}^n \to \mathbb{R}^m$ represented by an $m \times n$ matrix $A$:
$$\text{rank}(A) + \text{nullity}(A) = n$$
where $\text{rank}(A) = \dim(\text{Col}(A))$ and $\text{nullity}(A) = \dim(\text{Null}(A))$.`,

  "rank-and-inverse-matrix": `### 1. Rank of a Matrix $\rho(A)$
The rank of a matrix $A$ is the maximum number of linearly independent rows (or columns) in $A$:
$$\rho(A) = \dim(\text{Col}(A)) = \dim(\text{Row}(A))$$

---

### 2. Gauss-Jordan Inversion Algorithm
To compute $A^{-1}$, augment $A$ with the identity matrix $I_n$:
$$[A \mid I_n] \\xrightarrow{\text{Elementary Row Operations}} [I_n \mid A^{-1}]$$

**Solved Numerical:** Find inverse of $A = \begin{bmatrix} 1 & 1 & 1 \\ 1 & 2 & 3 \\ 1 & 4 & 9 \end{bmatrix}$.
$$[A \mid I] = \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 1 & 2 & 3 & \mid & 0 & 1 & 0 \\ 1 & 4 & 9 & \mid & 0 & 0 & 1 \end{bmatrix}$$
$$R_2 \to R_2 - R_1, \; R_3 \to R_3 - R_1 \implies \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 0 & 1 & 2 & \mid & -1 & 1 & 0 \\ 0 & 3 & 8 & \mid & -1 & 0 & 1 \end{bmatrix}$$
$$R_3 \to R_3 - 3R_2 \implies \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 0 & 1 & 2 & \mid & -1 & 1 & 0 \\ 0 & 0 & 2 & \mid & 2 & -3 & 1 \end{bmatrix}$$
$$R_3 \to \frac{1}{2} R_3 \implies R_3 = \begin{bmatrix} 0 & 0 & 1 & \mid & 1 & -1.5 & 0.5 \end{bmatrix}$$
Back-clearing upper triangular entries yields:
$$A^{-1} = \begin{bmatrix} 3 & -2.5 & 0.5 \\ -3 & 4 & -1 \\ 1 & -1.5 & 0.5 \end{bmatrix}$$`,

  "system-linear-equations": `### 1. Rouché-Capelli Consistency Theorem
For a non-homogeneous system of linear equations $AX = B$ with coefficient matrix $A$ and augmented matrix $[A \mid B]$:
- **Consistent System (At least one solution):**
  $$\rho(A) = \rho([A \mid B])$$
  - **Unique Solution:** $\rho(A) = \rho([A \mid B]) = n$ (number of unknowns).
  - **Infinitely Many Solutions:** $\rho(A) = \rho([A \mid B]) = r < n$. The general solution has $n - r$ independent free parameters.
- **Inconsistent System (No Solution):**
  $$\rho(A) < \rho([A \mid B])$$

---

### 2. Homogeneous Systems ($AX = \mathbf{0}$)
- Always consistent since $X = \mathbf{0}$ is the trivial solution.
- Has non-trivial solutions if and only if $\rho(A) < n$, which for an $n \times n$ matrix is equivalent to $\det(A) = 0$.`,

  "eigenvalues-and-diagonalization": `### 1. Characteristic Equation & Eigenvalues
For a square matrix $A \in \mathbb{R}^{n \times n}$:
$$A\mathbf{x} = \lambda\mathbf{x} \iff (A - \lambda I)\mathbf{x} = \mathbf{0}$$
Since $\mathbf{x} \neq \mathbf{0}$, the characteristic equation is:
$$\det(A - \lambda I) = 0$$

- $\sum \lambda_i = \text{Trace}(A) = \sum a_{ii}$
- $\prod \lambda_i = \det(A)$

---

### 2. Cayley-Hamilton Theorem & Inverse Calculation
Every square matrix satisfies its own characteristic polynomial:
$$P(\lambda) = \det(A - \lambda I) = (-1)^n \lambda^n + c_{n-1}\lambda^{n-1} + \dots + c_0 = 0 \implies P(A) = \mathbf{0}$$

**High-Yield Example:** Given $A = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}$:
$$\det(A - \lambda I) = (2 - \lambda)^2 - 1 = \lambda^2 - 4\lambda + 3 = 0$$
By Cayley-Hamilton Theorem:
$$A^2 - 4A + 3I = \mathbf{0} \implies 3I = 4A - A^2 \implies A^{-1} = \frac{1}{3}(4I - A)$$
$$A^{-1} = \frac{1}{3} \left( \begin{bmatrix} 4 & 0 \\ 0 & 4 \end{bmatrix} - \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix} \right) = \begin{bmatrix} 2/3 & -1/3 \\ -1/3 & 2/3 \end{bmatrix}$$

---

### 3. Diagonalization Condition
A matrix $A$ is diagonalizable iff it possesses $n$ linearly independent eigenvectors:
$$P^{-1} A P = D = \text{diag}(\lambda_1, \lambda_2, \dots, \lambda_n)$$
where matrix $P = [\mathbf{x}_1 \mid \mathbf{x}_2 \mid \dots \mid \mathbf{x}_n]$.`,

  "partial-derivatives": `### 1. First & Higher-Order Partial Derivatives
For a multivariable function $z = f(x, y)$:
$$\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h, y) - f(x, y)}{h}, \quad \frac{\partial f}{\partial y} = \lim_{k \to 0} \frac{f(x, y+k) - f(x, y)}{k}$$

By **Clairaut's / Schwarz's Theorem**, if second-order partials are continuous:
$$\frac{\partial^2 f}{\partial x \partial y} = \frac{\partial^2 f}{\partial y \partial x}$$

---

### 2. Multivariable Chain Rule
If $z = f(u, v)$ where $u = g(x, y)$ and $v = h(x, y)$:
$$\frac{\partial z}{\partial x} = \frac{\partial z}{\partial u}\frac{\partial u}{\partial x} + \frac{\partial z}{\partial v}\frac{\partial v}{\partial x}$$
$$\frac{\partial z}{\partial y} = \frac{\partial z}{\partial u}\frac{\partial u}{\partial y} + \frac{\partial z}{\partial v}\frac{\partial v}{\partial y}$$`,

  "eulers-theorem-homogeneous": `### 1. Definition of Homogeneous Function
A function $f(x, y)$ is homogeneous of degree $n$ if:
$$f(tx, ty) = t^n f(x, y) \quad \forall t > 0$$

---

### 2. Euler's Theorem Statement & High-Yield Proof
If $u = f(x, y)$ is a homogeneous function of degree $n$ with continuous partial derivatives:
$$x \frac{\partial u}{\partial x} + y \frac{\partial u}{\partial y} = n u$$

**Second-Order Deduction:**
$$x^2 \frac{\partial^2 u}{\partial x^2} + 2xy \frac{\partial^2 u}{\partial x \partial y} + y^2 \frac{\partial^2 u}{\partial y^2} = n(n-1)u$$

---

### 3. Standard Exam Question & Model Solution
**Problem:** If $u = \sin^{-1}\left(\frac{x+y}{\sqrt{x}+\sqrt{y}}\right)$, prove that $x \frac{\partial u}{\partial x} + y \frac{\partial u}{\partial y} = \frac{1}{2} \tan u$.
1. Let $z = \sin u = \frac{x+y}{\sqrt{x}+\sqrt{y}}$.
2. Check homogeneity of $z$:
   $$z(tx, ty) = \frac{tx + ty}{\sqrt{tx} + \sqrt{ty}} = \frac{t(x+y)}{t^{1/2}(\sqrt{x}+\sqrt{y})} = t^{1/2} z(x, y)$$
   Hence $z$ is a homogeneous function of degree $n = 1/2$.
3. By Euler's Theorem on $z$:
   $$x \frac{\partial z}{\partial x} + y \frac{\partial z}{\partial y} = n z = \frac{1}{2} \sin u$$
4. Since $z = \sin u$, $\frac{\partial z}{\partial x} = \cos u \frac{\partial u}{\partial x}$ and $\frac{\partial z}{\partial y} = \cos u \frac{\partial u}{\partial y}$:
   $$\cos u \left( x \frac{\partial u}{\partial x} + y \frac{\partial u}{\partial y} \right) = \frac{1}{2} \sin u$$
   $$x \frac{\partial u}{\partial x} + y \frac{\partial u}{\partial y} = \frac{1}{2} \frac{\sin u}{\cos u} = \frac{1}{2} \tan u \quad \text{(Q.E.D.)}$$`,

  "maxima-minima-2var": `### 1. Stationary Points
Find points $(a, b)$ satisfying the gradient condition:
$$p = \frac{\partial f}{\partial x} = 0, \quad q = \frac{\partial f}{\partial y} = 0$$

---

### 2. Second Derivative (Hessian Discriminant) Test
Evaluate at stationary point $(a, b)$:
$$r = \frac{\partial^2 f}{\partial x^2}, \quad s = \frac{\partial^2 f}{\partial x \partial y}, \quad t = \frac{\partial^2 f}{\partial y^2}, \quad \Delta = rt - s^2$$

| Condition on $\Delta = rt - s^2$ | Condition on $r$ | Nature of Stationary Point |
| :--- | :--- | :--- |
| $\Delta > 0$ | $r > 0$ | **Local Minimum** |
| $\Delta > 0$ | $r < 0$ | **Local Maximum** |
| $\Delta < 0$ | Any | **Saddle Point** (Neither max nor min) |
| $\Delta = 0$ | Any | **Inconclusive** (Further higher tests needed) |`,

  "lagrange-multipliers": `### 1. Method of Lagrange Multipliers
To optimize $f(x, y, z)$ subject to constraint $\phi(x, y, z) = 0$:
Construct the Lagrangian function:
$$\mathcal{L}(x, y, z, \lambda) = f(x, y, z) + \lambda \phi(x, y, z)$$

Set all partial derivatives to zero:
$$\frac{\partial \mathcal{L}}{\partial x} = 0, \quad \frac{\partial \mathcal{L}}{\partial y} = 0, \quad \frac{\partial \mathcal{L}}{\partial z} = 0, \quad \frac{\partial \mathcal{L}}{\partial \lambda} = 0$$

---

### 2. Solved Engineering Optimization Problem
**Problem:** Find the maximum volume of an open rectangular box with fixed surface area $S = 108\text{ cm}^2$.
1. Volume function: $V(x, y, z) = xyz$.
2. Surface area constraint (open top): $\phi(x, y, z) = xy + 2xz + 2yz - 108 = 0$.
3. Lagrangian: $\mathcal{L} = xyz + \lambda(xy + 2xz + 2yz - 108)$.
4. Gradient conditions:
   $$\mathcal{L}_x = yz + \lambda(y + 2z) = 0 \implies \lambda = -\frac{yz}{y + 2z}$$
   $$\mathcal{L}_y = xz + \lambda(x + 2z) = 0 \implies \lambda = -\frac{xz}{x + 2z}$$
   $$\mathcal{L}_z = xy + \lambda(2x + 2y) = 0 \implies \lambda = -\frac{xy}{2x + 2y}$$
5. Equating gives $x = y$ and $x = 2z$.
6. Substitute into constraint:
   $$x^2 + 2x(x/2) + 2x(x/2) = 108 \implies 3x^2 = 108 \implies x^2 = 36 \implies x = 6\text{ cm}$$
   $$y = 6\text{ cm}, \quad z = 3\text{ cm}$$
   $$\text{Maximum Volume } V_{\max} = 6 \times 6 \times 3 = 108\text{ cm}^3.$$`,

  "first-order-linear-odes": `### 1. Standard Linear Differential Equation
$$\frac{dy}{dx} + P(x) y = Q(x)$$
where $P(x)$ and $Q(x)$ are continuous functions of $x$ alone.

---

### 2. Integrating Factor (I.F.) & General Solution
$$I.F. = e^{\int P(x) \, dx}$$
The general solution is:
$$y \cdot (I.F.) = \int Q(x) \cdot (I.F.) \, dx + C$$

---

### 3. Worked Example
Solve $(1+x^2)\frac{dy}{dx} + 2xy = 4x^2$:
1. Divide by $1+x^2$: $\frac{dy}{dx} + \frac{2x}{1+x^2} y = \frac{4x^2}{1+x^2}$.
2. $I.F. = e^{\int \frac{2x}{1+x^2} dx} = e^{\ln(1+x^2)} = 1+x^2$.
3. General solution:
   $$y(1+x^2) = \int \frac{4x^2}{1+x^2} (1+x^2) \, dx = \int 4x^2 \, dx = \frac{4}{3} x^3 + C$$
   $$y = \frac{4x^3}{3(1+x^2)} + \frac{C}{1+x^2}$$`,

  "bernoulli-differential-equations": `### 1. Bernoulli's Non-Linear Form
$$\frac{dy}{dx} + P(x) y = Q(x) y^n \quad (n \neq 0, 1)$$

---

### 2. Reduction to Linear Equation
Divide by $y^n$:
$$y^{-n} \frac{dy}{dx} + P(x) y^{1-n} = Q(x)$$
Substitute $u = y^{1-n} \implies \frac{du}{dx} = (1-n) y^{-n} \frac{dy}{dx}$:
$$\frac{du}{dx} + (1-n) P(x) u = (1-n) Q(x)$$
Solved via standard integrating factor $I.F. = e^{\int (1-n)P(x) dx}$.`,

  "exact-differential-equations": `### 1. Condition for Exactness
The differential equation $M(x, y) dx + N(x, y) dy = 0$ is **exact** iff:
$$\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}$$

---

### 2. Solution Formula
$$\int_{y = \text{constant}} M \, dx + \int (\text{terms of } N \text{ not containing } x) \, dy = C$$

---

### 3. Integrating Factors for Inexact ODEs
- If $\frac{1}{N}\left(\frac{\partial M}{\partial y} - \frac{\partial N}{\partial x}\right) = f(x)$, then $I.F. = e^{\int f(x) dx}$.
- If $\frac{1}{M}\left(\frac{\partial N}{\partial x} - \frac{\partial M}{\partial y}\right) = g(y)$, then $I.F. = e^{\int g(y) dy}$.
- If $M dx + N dy = 0$ is homogeneous and $Mx + Ny \neq 0$, then $I.F. = \frac{1}{Mx + Ny}$.`,

  "double-integrals": `### 1. Double Integrals over Rectangles
$$\iint_R f(x, y) \, dA = \int_a^b \left( \int_c^d f(x, y) \, dy \right) dx = \int_c^d \left( \int_a^b f(x, y) \, dx \right) dy$$

---

### 2. Change of Order of Integration
Evaluate $I = \int_0^1 \int_x^1 \frac{\sin y}{y} \, dy \, dx$:
The integration region is $0 \le x \le y \le 1$.
Changing order of integration:
$$I = \int_0^1 \left( \int_0^y \frac{\sin y}{y} \, dx \right) dy = \int_0^1 \left[ \frac{\sin y}{y} x \right]_0^y dy = \int_0^1 \sin y \, dy = [-\cos y]_0^1 = 1 - \cos 1$$`,

  "vector-differential-operators": `### 1. The Del Operator (∇)
$$\nabla = \mathbf{i} \frac{\partial}{\partial x} + \mathbf{j} \frac{\partial}{\partial y} + \mathbf{k} \frac{\partial}{\partial z}$$

---

### 2. Gradient of a Scalar Field $\phi(x, y, z)$
$$\nabla \phi = \mathbf{i} \frac{\partial \phi}{\partial x} + \mathbf{j} \frac{\partial \phi}{\partial y} + \mathbf{k} \frac{\partial \phi}{\partial z}$$
- $\nabla \phi$ is a normal vector to the level surface $\phi(x, y, z) = C$.
- The **directional derivative** in direction of unit vector $\mathbf{\hat{u}}$ is $D_{\mathbf{\hat{u}}}\phi = \nabla\phi \cdot \mathbf{\hat{u}}$.`,

  "divergence-and-curl": `### 1. Divergence of Vector Field $\mathbf{V}$
$$\text{div } \mathbf{V} = \nabla \cdot \mathbf{V} = \frac{\partial V_1}{\partial x} + \frac{\partial V_2}{\partial y} + \frac{\partial V_3}{\partial z}$$
- If $\nabla \cdot \mathbf{V} = 0$, the vector field is **solenoidal** (incompressible fluid flow).

---

### 2. Curl of Vector Field $\mathbf{V}$
$$\text{curl } \mathbf{V} = \nabla \times \mathbf{V} = \begin{vmatrix} \mathbf{i} & \mathbf{j} & \mathbf{k} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ V_1 & V_2 & V_3 \end{vmatrix}$$
- If $\nabla \times \mathbf{V} = \mathbf{0}$, the vector field is **irrotational** (conservative, $\mathbf{V} = \nabla \phi$).`,

  // ==========================================
  // CSE1002: BASIC ELECTRICAL AND ELECTRONICS ENGINEERING
  // ==========================================
  "kirchhoffs-laws": `### 1. Kirchhoff's Current Law (KCL)
The algebraic sum of currents entering and leaving any electrical node is strictly zero (Conservation of Electric Charge):
$$\sum_{k=1}^n I_k = 0 \iff \sum I_{\text{in}} = \sum I_{\text{out}}$$

---

### 2. Kirchhoff's Voltage Law (KVL)
The algebraic sum of all voltages (potential drops and electromotive forces) around any closed loop is zero (Conservation of Energy):
$$\sum_{k=1}^m V_k = 0 \iff \sum E - \sum IR = 0$$

---

### 3. Systematic Mesh Analysis Algorithm
1. Identify all independent planar mesh loops and assign clockwise mesh currents $I_1, I_2, \dots, I_k$.
2. Formulate KVL matrix:
   $$\begin{bmatrix} R_{11} & -R_{12} \\ -R_{21} & R_{22} \end{bmatrix} \begin{bmatrix} I_1 \\ I_2 \end{bmatrix} = \begin{bmatrix} V_1 \\ V_2 \end{bmatrix}$$
3. Solve system using Cramer's Rule or matrix inverse.`,

  "thevenin-norton-theorems": `### 1. Thevenin's Theorem
Any linear two-terminal DC network can be replaced by an equivalent circuit containing:
- An open-circuit voltage source $V_{th}$.
- A series internal resistance $R_{th}$.

$$I_L = \frac{V_{th}}{R_{th} + R_L}, \quad V_L = I_L R_L$$

---

### 2. Norton's Theorem
Any linear two-terminal network can be replaced by:
- A short-circuit current source $I_N$.
- A parallel internal resistance $R_N = R_{th}$.

$$I_N = \frac{V_{th}}{R_{th}}$$

---

### 3. Steps to Calculate $R_{th}$
1. Deactivate all independent sources:
   - Voltage sources $\to$ Short circuit ($0\text{ V}$).
   - Current sources $\to$ Open circuit ($0\text{ A}$).
2. Compute equivalent resistance across open terminals $A-B$.`,

  "superposition-and-mpt": `### 1. Superposition Theorem
In any linear bilateral network containing multiple independent sources, the response in any branch is the algebraic sum of the responses caused by each independent source acting alone:
$$I = I^{(1)} + I^{(2)} + \dots + I^{(n)}$$

---

### 2. Maximum Power Transfer (MPT) Theorem
A resistive load $R_L$ connected across a linear network receives maximum power when the load resistance equals the Thevenin resistance:
$$R_L = R_{th}$$

**Maximum Power Formula:**
$$P_{\max} = I_L^2 R_L = \left(\frac{V_{th}}{2 R_{th}}\right)^2 R_{th} = \frac{V_{th}^2}{4 R_{th}}$$
Efficiency under maximum power transfer is strictly $\eta = 50\%$.`,

  "pn-junction-characteristics": `### 1. PN Junction Diode V-I Characteristics
The Shockley diode equation models current flow:
$$I = I_0 \left( e^{\frac{q V}{\eta k T}} - 1 \right) = I_0 \left( e^{\frac{V}{\eta V_T}} - 1 \right)$$
where $V_T = \frac{kT}{q} \approx 26\text{ mV}$ at room temperature ($300\text{ K}$), $\eta = 1$ for Ge, $\eta = 2$ for Si.

- **Forward Bias:** Cut-in / Knee voltage:
  - Silicon ($Si$): $V_\gamma \approx 0.7\text{ V}$
  - Germanium ($Ge$): $V_\gamma \approx 0.3\text{ V}$
- **Reverse Bias:** Tiny reverse saturation current $I_0$ ($nA$ for Si, $\mu A$ for Ge) until reaching the Zener/Avalanche breakdown voltage.`,

  "rectifiers-and-filters": `### 1. Half-Wave vs Full-Wave Rectifiers Comparison

| Parameter | Half-Wave Rectifier | Full-Wave Center-Tap | Full-Wave Bridge Rectifier |
| :--- | :--- | :--- | :--- |
| **Diodes Count** | 1 | 2 | 4 |
| **DC Voltage $V_{dc}$** | $\frac{V_m}{\pi} \approx 0.318 V_m$ | $\frac{2 V_m}{\pi} \approx 0.637 V_m$ | $\frac{2 V_m}{\pi} \approx 0.637 V_m$ |
| **RMS Voltage $V_{rms}$** | $\frac{V_m}{2} = 0.5 V_m$ | $\frac{V_m}{\sqrt{2}} \approx 0.707 V_m$ | $\frac{V_m}{\sqrt{2}} \approx 0.707 V_m$ |
| **Ripple Factor $\gamma$** | $\mathbf{1.21}$ | $\mathbf{0.482}$ | $\mathbf{0.482}$ |
| **Efficiency $\eta$** | $\mathbf{40.6\%}$ | $\mathbf{81.2\%}$ | $\mathbf{81.2\%}$ |
| **Peak Inverse Voltage (PIV)** | $V_m$ | $2 V_m$ | $V_m$ |
| **Output Frequency** | $f_{\text{in}}$ | $2 f_{\text{in}}$ | $2 f_{\text{in}}$ |

---

### 2. Capacitor Filter Ripple Factor Derivation
With a shunt filter capacitor $C$ across load $R_L$:
$$\gamma = \frac{1}{2\sqrt{3} f C R_L} \quad (\text{Full-Wave Bridge})$$`,

  "zener-voltage-regulator": `### 1. Zener Diode Working Principle
A Zener diode is a heavily doped PN junction diode designed to operate stably in the **reverse breakdown region** where voltage remains constant ($V_Z$) across a wide variation of current $I_Z$.

---

### 2. Voltage Regulator Design Equation
- Series current limiting resistor $R_S$:
  $$R_S = \frac{V_{\text{in}} - V_Z}{I_Z + I_L}$$
- Maximum and Minimum Zener Current:
  $$I_{Z,\min} \le I_Z \le I_{Z,\max} = \frac{P_{Z,\max}}{V_Z}$$`,

  "bjt-configurations": `### 1. BJT Terminals & Operation
Bipolar Junction Transistor consists of three regions: Emitter (heavily doped), Base (lightly doped, very thin), and Collector (moderately doped, largest area).
$$I_E = I_B + I_C$$

---

### 2. Current Gain Parameters
- **Common Base Current Gain ($\alpha$):**
  $$\alpha = \frac{I_C}{I_E} \quad (0.95 \le \alpha < 1)$$
- **Common Emitter Current Gain ($\beta$):**
  $$\beta = \frac{I_C}{I_B} \quad (20 \le \beta \le 500)$$
- **Fundamental Relation:**
  $$\beta = \frac{\alpha}{1 - \alpha}, \quad \alpha = \frac{\beta}{1 + \beta}$$`,

  "bjt-switch-amplifier": `### 1. BJT as an Electronic Switch
- **Cutoff Region (OFF state):** $V_{BE} < 0.7\text{V}, \; I_B = 0, \; I_C = 0, \; V_{CE} = V_{CC}$.
- **Saturation Region (ON state):** Both BE and BC junctions forward biased, $V_{CE(\text{sat})} \approx 0.2\text{V}, \; I_{C(\text{sat})} = \frac{V_{CC} - 0.2}{R_C}$.

---

### 2. Common Emitter (CE) Amplifier
- Input applied to Base, output taken from Collector.
- Phase Inversion: 180° phase shift between input and output AC signals.`,

  "mosfet-and-cmos": `### 1. MOSFET Operation
Voltage-controlled device with near-infinite input impedance ($I_G \approx 0$).
- **Threshold Voltage $V_{th}$:** Minimum gate voltage to create inversion channel.
- **Drain Current in Saturation:**
  $$I_D = \frac{1}{2} \mu_n C_{ox} \frac{W}{L} (V_{GS} - V_{th})^2$$

---

### 2. CMOS Inverter
Consists of complementary PMOS pull-up and NMOS pull-down transistors.
- When $V_{\text{in}} = 0$ (Logic 0): PMOS ON, NMOS OFF $\implies V_{\text{out}} = V_{DD}$ (Logic 1).
- When $V_{\text{in}} = V_{DD}$ (Logic 1): PMOS OFF, NMOS ON $\implies V_{\text{out}} = 0$ (Logic 0).
- Static power dissipation is zero.`,

  "ideal-opamp-characteristics": `### 1. Ideal Operational Amplifier Characteristics
- **Open-Loop Gain ($A_{OL}$):** $\infty$
- **Input Impedance ($R_{\text{in}}$):** $\infty \implies I_+ = I_- = 0$
- **Output Impedance ($R_{\text{out}}$):** $0$
- **Bandwidth ($BW$):** $\infty$
- **Common Mode Rejection Ratio (CMRR):** $\infty$
- **Slew Rate ($SR$):** $\infty$

---

### 2. The Virtual Ground Concept
Because $A_{OL} = \infty$ and output $V_o$ is finite in negative feedback:
$$V_+ - V_- = \frac{V_o}{A_{OL}} = 0 \implies V_+ = V_-$$
If $V_+ = 0$ (ground), then $V_- = 0$ (**Virtual Ground**).`,

  "inverting-non-inverting-opamp": `### 1. Inverting Amplifier
$$V_o = -\frac{R_f}{R_1} V_{\text{in}}$$
$$\text{Gain } A_v = -\frac{R_f}{R_1}$$

---

### 2. Non-Inverting Amplifier
$$V_o = \left( 1 + \frac{R_f}{R_1} \right) V_{\text{in}}$$
$$\text{Gain } A_v = 1 + \frac{R_f}{R_1} \ge 1$$`,

  "opamp-applications": `### 1. Summing Amplifier
$$V_o = -R_f \left( \frac{V_1}{R_1} + \frac{V_2}{R_2} + \frac{V_3}{R_3} \right)$$

---

### 2. Integrator & Differentiator
- **Integrator:** $V_o(t) = -\frac{1}{RC} \int_0^t V_{\text{in}}(\tau) \, d\tau$
- **Differentiator:** $V_o(t) = -RC \frac{dV_{\text{in}}(t)}{dt}$`,

  "beee-lab-exp-1": `### BEEE Lab — Experiment 1: Component Identification & DMM Testing
**Aim:** To identify common electronic components and measure their electrical values using a Digital Multimeter (DMM).

---

### 1. Resistor 4-Band Color Code Formula
$$R = (\text{Band } 1 \times 10 + \text{Band } 2) \times 10^{\text{Multiplier}} \pm \text{Tolerance } \%$$
- **Mnemonic:** *BBROY Great Britain Very Good Wife* (0 to 9).
- Tolerance: Gold ($\pm 5\%$), Silver ($\pm 10\%$).

---

### 2. Diode Testing with DMM
Set DMM to Diode mode:
- Forward Bias: Red probe to Anode, Black to Cathode $\implies 0.65\text{V} - 0.72\text{V}$ for Silicon.
- Reverse Bias: Reversing probes $\implies$ Displays \`OL\` (infinite resistance).`,

  "beee-lab-exp-2": `### BEEE Lab — Experiment 2: Verification of KVL and KCL
**Aim:** To experimentally verify Kirchhoff's Voltage Law (KVL) in a series circuit and Kirchhoff's Current Law (KCL) in a parallel circuit.

---

### 1. Observation Table (KCL at Node A)
| Total Current $I_{\text{total}}$ | Branch Current $I_2$ | Branch Current $I_3$ | Calculated $I_2 + I_3$ | % Error |
| :--- | :--- | :--- | :--- | :--- |
| $5.17\text{ mA}$ | $3.10\text{ mA}$ | $2.07\text{ mA}$ | $5.17\text{ mA}$ | $0.0\%$ |

---

### 2. Observation Table (KVL across Mesh 1)
| Source Voltage $V_S$ | Drop across $R_1$ | Drop across $R_2$ | Loop Sum $V_{R1} + V_{R2}$ | % Error |
| :--- | :--- | :--- | :--- | :--- |
| $12.00\text{ V}$ | $5.17\text{ V}$ | $6.83\text{ V}$ | $12.00\text{ V}$ | $0.0\%$ |`,

  "beee-lab-exp-3": `### BEEE Lab — Experiment 3: PN Junction Diode V-I Characteristics
**Aim:** To plot the forward and reverse bias V-I characteristics of a Silicon PN junction diode (1N4007) and determine cut-in voltage and dynamic resistance.

---

### 1. Forward Bias Measurements
- Knee / Cut-In Voltage: $V_\gamma = 0.70\text{ V}$.
- Dynamic (AC) Forward Resistance:
  $$r_d = \frac{\Delta V_F}{\Delta I_F} \approx \frac{0.75 - 0.70}{(25 - 10) \times 10^{-3}} = \frac{0.05}{15 \times 10^{-3}} \approx 3.33\,\Omega$$`,

  "beee-lab-exp-4": `### BEEE Lab — Experiment 4: Half-Wave Rectifier with Capacitor Filter
**Aim:** To construct a half-wave rectifier, observe input/output waveforms on CRO, and calculate DC voltage, RMS voltage, and ripple factor.

---

### 1. Circuit Equations
Given peak voltage $V_m = 15\text{ V}$:
$$V_{dc} = \frac{V_m}{\pi} = 4.77\text{ V}, \quad V_{rms} = \frac{V_m}{2} = 7.50\text{ V}$$
$$\text{Ripple Factor } \gamma = \sqrt{\left(\frac{7.50}{4.77}\right)^2 - 1} = 1.21$$
Adding filter capacitor $C = 100\,\mu\text{F}$ reduces ripple factor to $\gamma < 0.1$.`,

  "beee-lab-exp-5": `### BEEE Lab — Experiment 5: Center-Tap & Bridge Full-Wave Rectifiers
**Aim:** To construct and compare center-tap and bridge full-wave rectifiers with a half-wave rectifier.

---

### 1. Comparative Observations
- Rectification Efficiency: $\eta = 81.2\%$ (twice that of half-wave rectifier).
- Unfiltered Ripple Factor: $\gamma = 0.482$.
- Peak Inverse Voltage (Bridge): $V_m$ (Center-tap requires $2V_m$).`,

  // ==========================================
  // CSE1003: COMPUTER ORGANIZATION AND ARCHITECTURE
  // ==========================================
  "von-neumann-vs-harvard": `### 1. Architecture Comparison (COA Assignment 1, Q2)

| Feature | Von Neumann Architecture | Harvard Architecture |
| :--- | :--- | :--- |
| **Bus Structure** | Single shared bus for instructions & data | Separate physical address/data buses for instructions & data |
| **Execution** | Instruction fetch and data read cannot occur concurrently | Simultaneous instruction fetch and memory data operand access |
| **Bottleneck** | **Von Neumann Bottleneck** limits throughput | Bottleneck eliminated through isolated memory paths |
| **Hardware** | Simpler CPU layout, lower pin count | Complex routing, higher pin count and separate cache controllers |
| **Usage** | General desktop CPUs (Intel x86, AMD64) | DSP processors, microcontrollers (AVR, PIC, ARM Cortex-M) |`,

  "eight-great-ideas-architecture": `### Eight Great Ideas in Computer Architecture (COA Assignment 1, Q3)
1. **Design for Moore's Law:** Anticipate future transistor counts during long design cycles.
2. **Use Abstraction to Simplify Design:** Modular hardware hierarchy hiding lower circuit gates.
3. **Make the Common Case Fast:** Optimize instructions executed >80% of time (Amdahl's Law).
4. **Performance via Parallelism:** Execute simultaneous operations via SIMD/multicore.
5. **Performance via Pipelining:** Overlap instruction stages (Fetch, Decode, Execute).
6. **Performance via Prediction:** Speculative branch execution rather than waiting for stall.
7. **Hierarchy of Memories:** Fast small L1/L2 caches backing larger slower DRAM.
8. **Dependability via Redundancy:** ECC memory and RAID disks to prevent catastrophic system crash.`,

  "booths-multiplication-algorithm": `### 1. Booth's Multiplication Algorithm
Multiplies signed binary integers in 2's complement representation.
- Let multiplicand be $M$, multiplier be $Q$.
- Extra 1-bit register $Q_{-1} = 0$, Accumulator $A = 0$.
- Step count $n = \text{number of bits in } Q$.

---

### 2. Booth's Decision Table
| $Q_0$ | $Q_{-1}$ | Action |
| :--- | :--- | :--- |
| **0** | **0** | Arithmetic Right Shift $(A, Q, Q_{-1})$ |
| **0** | **1** | $A = A + M$, then Arithmetic Right Shift |
| **1** | **0** | $A = A - M$, then Arithmetic Right Shift |
| **1** | **1** | Arithmetic Right Shift $(A, Q, Q_{-1})$ |

*Arithmetic Right Shift (ASR) preserves the most significant sign bit of $A$.*

---

### 3. Worked Example: Multiply $(+7) \times (-3)$
- $M = +7 = 00111_2$, $-M = 11001_2$, $Q = -3 = 11101_2$, $n = 5$ bits:

| Step | Operation | $A$ | $Q$ | $Q_{-1}$ | Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial** | Load inputs | $00000$ | $11101$ | $0$ | 5 |
| **1** | $Q_0 Q_{-1} = 10 \implies A = A - M$, ASR | $11100$ | $11110$ | $1$ | 4 |
| **2** | $Q_0 Q_{-1} = 01 \implies A = A + M$, ASR | $00000$ | $11111$ | $0$ | 3 |
| **3** | $Q_0 Q_{-1} = 10 \implies A = A - M$, ASR | $11100$ | $11111$ | $1$ | 2 |
| **4** | $Q_0 Q_{-1} = 11 \implies \text{ASR}$ | $11110$ | $01111$ | $1$ | 1 |
| **5** | $Q_0 Q_{-1} = 11 \implies \text{ASR}$ | $11111$ | $00111$ | $1$ | 0 |

Result in $A Q = 1111101011_2 = -21_{10}$ (Verified Correct!).`,

  "ieee-754-floating-point": `### 1. Single-Precision Format (32-bit Standard)
$$V = (-1)^S \times (1.M) \times 2^{E - 127}$$
- **Sign Bit ($S$):** 1 bit ($0 = \text{positive}, 1 = \text{negative}$).
- **Biased Exponent ($E$):** 8 bits, Bias $= 2^{8-1} - 1 = 127$.
- **Fraction / Mantissa ($M$):** 23 bits (implicit normalized leading 1).

---

### 2. Conversion Example: Convert $-118.625_{10}$ to IEEE-754 Single Precision
1. Sign: Negative $\implies S = 1$.
2. Magnitude: $118_{10} = 1110110_2$, $0.625_{10} = 0.101_2 \implies 1110110.101_2$.
3. Normalize: $1.110110101_2 \times 2^6$.
4. Biased Exponent: $E = 6 + 127 = 133 = 10000101_2$.
5. Mantissa: $11011010100000000000000_2$.
6. Final 32-bit pattern: \`1 10000101 11011010100000000000000\` = \`0xC2ECB400\`.`,

  "isa-and-instruction-types": `### 1. Instruction Set Architecture (COA Assignment 2, Q1 & Q2)
ISA defines the programmer-visible interface to hardware: registers, instructions, addressing modes, and exception mechanisms.

---

### 2. Classification by Operand Address Count
- **3-Address:** \`ADD R1, R2, R3\` ($R_1 \leftarrow R_2 + R_3$).
- **2-Address:** \`ADD R1, R2\` ($R_1 \leftarrow R_1 + R_2$).
- **1-Address (Accumulator):** \`ADD X\` ($AC \leftarrow AC + M[X]$).
- **0-Address (Stack Architecture):** \`ADD\` (Pops top two operands from stack and pushes sum).`,

  "addressing-modes-and-rtl": `### 1. Register Transfer Language (RTL) (COA Assignment 2, Q3)
Symbolic notation describing micro-operations between CPU registers:
- \`R2 <- R1\`: Direct register transfer.
- \`DR <- M[AR]\`: Memory read operation.
- \`M[AR] <- AC\`: Memory write operation.

---

### 2. Common Addressing Modes
- **Immediate:** \`ADD #5\` ($Operand = 5$).
- **Direct:** \`ADD 2000\` ($EA = 2000$).
- **Indirect:** \`ADD @2000\` ($EA = M[2000]$).
- **Register Direct / Indirect:** Operand in register / Register holds memory address pointer.
- **Displacement:** $EA = A + (R)$.`,

  "risc-vs-cisc-architecture": `### RISC vs CISC Architecture Comparison (COA Assignment 2, Q9)

| Characteristic | RISC (Reduced Instruction Set Computer) | CISC (Complex Instruction Set Computer) |
| :--- | :--- | :--- |
| **Instruction Size** | Fixed length (typically 32-bit) | Variable length (1 to 15 bytes) |
| **Execution Speed** | Single-cycle execution per instruction | Multi-cycle execution |
| **Memory Access** | Strictly load/store architecture (\`LOAD\`, \`STORE\`) | Memory operands allowed directly in ALU operations |
| **Control Unit** | Hardwired control logic (high speed) | Microprogrammed control store (ROM) |
| **Registers** | Large register file ($32-128$ GPRs) | Fewer general-purpose registers ($8-16$) |
| **Examples** | ARM, RISC-V, MIPS | Intel x86, AMD64 |`,

  "pipelining-and-hazards": `### 1. Classic 5-Stage RISC Instruction Pipeline
1. **IF (Instruction Fetch):** Fetch instruction from cache into IR.
2. **ID (Instruction Decode / Register Read):** Decode opcode and read register file.
3. **EX (Execute / ALU):** Perform ALU calculation or memory effective address.
4. **MEM (Memory Access):** Read or write data from/to data cache.
5. **WB (Write-Back):** Write ALU result back into register file.

---

### 2. Pipeline Hazards & Mitigations
- **Structural Hazards:** Resource conflict. Solved via split Harvard caches (separate I-cache & D-cache).
- **Data Hazards (RAW, WAR, WAW):** Operand dependency. Solved via **Hardware Data Forwarding (Bypassing)** or pipeline stalls (bubbles).
- **Control Hazards:** Branch instructions alter PC. Solved via dynamic branch prediction.`,

  "memory-hierarchy-design": `### 1. Memory Hierarchy Triangle
1. **CPU Registers:** $0.5\text{ ns}$, $< 1\text{ KB}$, on-chip.
2. **L1 Cache (Split I/D):** $1\text{ ns}$, $32-64\text{ KB}$, on-chip SRAM.
3. **L2 Cache:** $3-5\text{ ns}$, $512\text{ KB}-2\text{ MB}$, SRAM.
4. **L3 Cache:** $10-20\text{ ns}$, $8-32\text{ MB}$, shared SRAM.
5. **Main Memory (DRAM):** $50-100\text{ ns}$, $8-64\text{ GB}$, off-chip DRAM.
6. **Secondary Storage (SSD/NVMe):** $10-50\, \mu\text{s}$, $512\text{ GB}-2\text{ TB}$, Flash.

---

### 2. Average Memory Access Time (AMAT)
$$\text{AMAT} = \text{Hit Time} + (\text{Miss Rate} \times \text{Miss Penalty})$$`,

  "cache-mapping-techniques": `### 1. Cache Mapping Mechanisms
- **Direct Mapping:** Each memory block maps to exactly one cache line:
  $$\text{Line Number} = \text{Block Address} \pmod{\text{Number of Cache Lines}}$$
- **Fully Associative:** A memory block can reside in any cache line. Minimal conflict misses, requires expensive associative comparators.
- **Set-Associative ($k$-way):** Cache is divided into sets with $k$ lines per set:
  $$\text{Set Index} = \text{Block Address} \pmod{\text{Number of Sets}}$$

---

### 2. Address Bit Splitting Example
For a 32-bit byte-addressable system with a 64 KB 4-way set-associative cache and 64-byte block size:
- **Block Offset:** $\log_2(64) = 6$ bits.
- **Number of Lines:** $\frac{64\text{ KB}}{64\text{ B}} = 1024$ lines.
- **Number of Sets:** $\frac{1024}{4} = 256 \implies \text{Set Index} = \log_2(256) = 8$ bits.
- **Tag Bits:** $32 - (8 + 6) = 18$ bits.`,

  "cache-replacement-and-write-policies": `### 1. Cache Replacement Policies
- **LRU (Least Recently Used):** Evicts line that has not been referenced for the longest time.
- **FIFO (First-In, First-Out):** Evicts oldest line loaded.
- **LFU (Least Frequently Used):** Evicts line with smallest access count.

---

### 2. Cache Write Policies
- **Write-Through:** Memory updated simultaneously on every cache write.
- **Write-Back:** Data written only to cache line with **Dirty Bit** set. Main memory updated only when dirty line is evicted.`,

  // ==========================================
  // CSE1004: FUNDAMENTALS OF WEB TECHNOLOGIES
  // ==========================================
  "web-evolution-and-arpanet": `### 1. Milestones of Web Evolution
- **1969 — ARPANET:** First packet-switching network utilizing Interface Message Processors (IMPs).
- **1989 — CERN & Tim Berners-Lee:** Invention of HTML, HTTP, and URLs to link scientific documents.
- **Web 1.0 (1991–2004):** Static HTML read-only web.
- **Web 2.0 (2004–Present):** Participatory, user-generated content, AJAX, Web APIs, single page applications.
- **Web 3.0:** Semantic data graphs, decentralization, cryptographic verification.`,

  "client-server-and-dns": `### 1. Client-Server Architecture
- **Client (User Agent):** Requests resources (Web Browser, Mobile App).
- **Server:** Listens on specific ports (Port 80 HTTP, Port 443 HTTPS) and serves resources.

---

### 2. DNS Resolution Steps
1. Browser checks local cache -> OS cache -> Router cache.
2. Query sent to ISP Recursive Resolver.
3. Recursive resolver queries Root Nameserver (\`.\`).
4. Root directs to TLD Nameserver (\`.org\`, \`.com\`).
5. TLD nameserver directs to Authoritative Nameserver.
6. Authoritative server returns A/AAAA IP address.`,

  "http-https-status-codes": `### 1. HTTP Methods
- **GET:** Retrieve representation of resource (idempotent, safe).
- **POST:** Submit data to server to create new entity.
- **PUT:** Replace target resource entirely (idempotent).
- **DELETE:** Remove target resource (idempotent).

---

### 2. Standard HTTP Status Codes
- **2xx Success:** \`200 OK\`, \`201 Created\`, \`204 No Content\`.
- **3xx Redirection:** \`301 Moved Permanently\`, \`304 Not Modified\`.
- **4xx Client Errors:** \`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`.
- **5xx Server Errors:** \`500 Internal Server Error\`, \`502 Bad Gateway\`, \`503 Service Unavailable\`.`,

  "html5-semantic-elements": `### 1. Semantic HTML5 Elements
Semantic tags convey meaning to browsers, search engines, and screen readers:
- \`<header>\`: Introductory content or navigational links.
- \`<nav>\`: Set of primary site navigation links.
- \`<main>\`: Dominant content unique to the document.
- \`<article>\`: Self-contained independent composition.
- \`<section>\`: Thematic grouping of content with heading.
- \`<aside>\`: Tangentially related content.
- \`<footer>\`: Author, copyright, legal disclaimer.`,

  "html-lists-tables-forms": `### 1. HTML Lists (Practical 2)
- Ordered: \`<ol type="1">\` with \`<li>\`.
- Unordered: \`<ul>\` with \`<li>\`.
- Description List: \`<dl>\`, \`<dt>\` (term), \`<dd>\` (description).

---

### 2. Accessible HTML Tables
\`\`\`html
<table>
  <caption>Student Term Scores</caption>
  <thead>
    <tr><th scope="col">Roll No</th><th scope="col">Name</th><th scope="col">Marks</th></tr>
  </thead>
  <tbody>
    <tr><td>101</td><td>Alice</td><td>94</td></tr>
  </tbody>
</table>
\`\`\`

---

### 3. Forms & HTML5 Validation
Attributes: \`required\`, \`type="email"\`, \`pattern="[0-9]{10}"\`, \`min\`, \`max\`.`,

  "css-box-model-selectors": `### 1. CSS Box Model
$$\text{Total Width} = \text{Content Width} + \text{Padding} + \text{Border} + \text{Margin}$$
Using \`box-sizing: border-box\` causes specified width and height to include content, padding, and border.

---

### 2. Specificity Hierarchy
$$\text{Inline Styles } (1000) > \text{IDs } (100) > \text{Classes, Attributes, Pseudo-classes } (10) > \text{Elements } (1)$$`,

  "css-flexbox-and-grid": `### 1. CSS Flexbox (1-Dimensional Layout)
- Container: \`display: flex; flex-direction: row | column;\`
- Alignment along main axis: \`justify-content: center | space-between;\`
- Alignment along cross axis: \`align-items: center | flex-start;\`

---

### 2. CSS Grid (2-Dimensional Layout)
\`\`\`css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
\`\`\``,

  // ==========================================
  // CSE1005: PYTHON PROGRAMMING
  // ==========================================
  "python-architecture-features": `### 1. Key Features of Python
- **High-Level & Interpreted:** Executes via bytecode on the Python Virtual Machine (PVM).
- **Dynamically Typed:** Variable types are bound at runtime without explicit declarations.
- **Automatic Garbage Collection:** Reference counting augmented with cyclic garbage collector.
- **Multi-Paradigm:** Supports procedural, object-oriented, and functional programming.`,

  "conditional-statements-ternary": `### 1. Control Flow & Branching
\`\`\`python
score = 85
if score >= 90:
    grade = "A+"
elif score >= 80:
    grade = "A"
else:
    grade = "B"

# Inline Ternary Expression:
status = "Pass" if score >= 40 else "Fail"
\`\`\``,

  "loops-and-control-flow": `### 1. Loop Control Statements
- \`break\`: Immediately terminates loop execution.
- \`continue\`: Skips remainder of current iteration and proceeds to next loop test.
- \`pass\`: Syntactic placeholder null statement.
- **Loop Else Clause:** The \`else\` block executes only if loop finishes normally without encountering a \`break\`!

\`\`\`python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            break
    else:
        print(f"{n} is prime!")
\`\`\``,

  "functions-args-kwargs-recursion": `### 1. Arbitrary Arguments (*args, **kwargs)
- \`*args\`: Collects positional arguments into a \`tuple\`.
- \`**kwargs\`: Collects keyword arguments into a \`dict\`.

\`\`\`python
def compute_stats(*scores, **metadata):
    total = sum(scores)
    avg = total / len(scores) if scores else 0
    return {"mean": avg, "course": metadata.get("course", "CSE1005")}

print(compute_stats(88, 92, 79, course="Python"))
\`\`\`

---

### 2. LEGB Scope Rule
Python resolves variable names in strict order: **L**ocal $\to$ **E**nclosing $\to$ **G**lobal $\to$ **B**uilt-in.`,

  "strings-and-string-methods": `### 1. String Slicing & Immutability
Strings are immutable ordered sequences of Unicode characters:
- Slicing syntax: \`s[start : stop : step]\`
- Reverse string idiom: \`s[::-1]\`

\`\`\`python
s = "DYPIU University"
print(s.lower())         # dypiu university
print(s.split(" "))      # ['DYPIU', 'University']
print("-".join(["2026", "Sem1"]))  # 2026-Sem1
\`\`\``,

  "lists-tuples-comprehensions": `### 1. Lists vs Tuples
- **List:** Mutable sequence defined with \`[ ]\`. Methods: \`append()\`, \`extend()\`, \`insert()\`, \`pop()\`, \`sort()\`.
- **Tuple:** Immutable sequence defined with \`( )\`. Supports tuple packing and unpacking.

---

### 2. List Comprehension Syntax
$$\text{new\_list} = [\text{expression} \; \textbf{for} \; \text{item} \; \textbf{in} \; \text{iterable} \; \textbf{if} \; \text{condition}]$$

\`\`\`python
squares = [x**2 for x in range(1, 11) if x % 2 == 0]
# [4, 16, 36, 64, 100]
\`\`\``,

  "dictionaries-and-sets": `### 1. Dictionary Hash Tables
Key-value mappings with $O(1)$ average time complexity for lookups, insertions, and deletions:
\`\`\`python
student = {"prn": "2026CSE001", "name": "Rahul", "cgpa": 9.2}
keys = list(student.keys())
values = list(student.values())
items = list(student.items())
\`\`\`

---

### 2. Set Operations
Unordered collections of unique hashable elements:
- Union: \`A | B\`
- Intersection: \`A & B\`
- Difference: \`A - B\``,

  "numpy-basics-vectorization": `### 1. NumPy ndarrays & Vectorized Operations
NumPy stores data in contiguous C-order memory buffers, executing element-wise operations at native speed without Python loop overhead:

\`\`\`python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix Dot Product:
C = np.dot(A, B)   # or A @ B
# Eigenvalues:
eigenvals, eigenvecs = np.linalg.eig(A)
\`\`\``,

  "pandas-dataframes-operations": `### 1. Pandas Series & DataFrames
\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "PRN": [101, 102, 103],
    "Score": [88, 95, 72]
})

# Filter students with Score > 80:
top = df[df["Score"] > 80]
mean_score = df["Score"].mean()
\`\`\``,

  // ==========================================
  // CSE1006: INDIAN KNOWLEDGE SYSTEMS (IKS)
  // ==========================================
  "iks-framework-foundations": `### 1. 14 Vidyasthanas of Ancient India
The Indian Knowledge System is historically structured into **14 Vidyasthanas**:
- **4 Vedas:** Rigveda, Yajurveda, Samaveda, Atharvaveda.
- **6 Vedangas:** Shiksha (Phonetics), Kalpa (Ritual/Geometry), Vyakarana (Grammar), Nirukta (Etymology), Chandas (Metre), Jyotisha (Astronomy/Mathematics).
- **4 Upangas:** Mimamsa (Interpretation), Nyaya (Epistemology & Logic), Purana (History/Cosmology), Dharma Shastra (Jurisprudence).`,

  "panini-ashtadhyayi-linguistics": `### 1. Panini's Formal Grammar System
Composed in 4th century BCE, the *Ashtadhyayi* contains ~4,000 algorithmic sutras formalizing Sanskrit phonology and syntax.
- **Anticipation of BNF:** Noam Chomsky and Leonard Bloomfield recognized Panini's meta-rules as the precursor to **Backus-Naur Form (BNF)** used in modern compiler grammars.
- **Sivasutras:** 14 aphorisms organizing sounds into sound classes using auxiliary markers (*it* symbols) analogous to modern regular expressions.`,

  "sulba-sutras-and-aryabhata": `### 1. Baudhayana's Theorem in Sulba Sutras (800 BCE)
$$a^2 + b^2 = c^2$$
*The diagonal of a rectangle produces by itself both the areas which the length and breadth produce separately.* (Pre-dates Pythagoras by centuries).

---

### 2. Aryabhata's Contributions (499 CE)
- **Place Value & Shunya (Zero):** Developed decimal system and algorithmic operations.
- **Approximation of Pi:** $\pi \approx \frac{62832}{20000} = 3.1416$.
- **Astronomy:** Identified that the Earth rotates on its axis and planetary orbits are elliptical.`,

  "indian-metallurgy-wootz-steel": `### 1. Ancient Metallurgy Achievements
- **Wootz Steel (Ukku):** High-carbon crucible steel manufactured in Southern India, exported worldwide to make Damascus blades.
- **Delhi Iron Pillar (4th Century CE):** 6-tonne forged wrought iron column standing rust-free for >1600 years due to protective *misawite* ($\delta$-FeOOH) catalytic layer formed from high phosphorus slag.
- **Zinc Smelting at Zawar (Rajasthan):** First industrial distillation process using downward retorts (12th Century).`,
};

/**
 * Returns dynamic question paper and marking schemes customized per subject.
 */
export function getSubjectPaperContent(
  subjectCode: string,
  paperTitle: string,
  examYear: number,
  examType: string,
  isSolution: boolean
): string {
  if (isSolution) {
    if (subjectCode === "CSE1003") {
      return `### Official Model Solution & Evaluation Scheme — ${paperTitle}
**Subject Code:** ${subjectCode} | **Academic Year:** ${examYear} | **Type:** ${examType}

---

#### Q1: Evolution of Computing Systems [5 Marks]
- **First Generation (1940–1956):** Vacuum tubes, magnetic drums, machine language.
- **Second Generation (1956–1963):** Transistors, magnetic core memory, FORTRAN/COBOL.
- **Third Generation (1964–1971):** Integrated Circuits (ICs), semiconductor memory.
- **Fourth Generation (1971–Present):** VLSI/ULSI microprocessors (Intel 4004 to modern multi-core).

---

#### Q2: Von Neumann vs Harvard Architecture Comparison [5 Marks]
- Von Neumann uses unified bus and shared memory space $\implies$ **Von Neumann Bottleneck**.
- Harvard uses separate physical buses for instructions and data $\implies$ simultaneous fetch and operand access.

---

#### Q3: Booth's Multiplication Numerical [10 Marks]
Multiply $(+7) \times (-3)$ using 5-bit Booth's Algorithm:
Multiplicand $M = +7 = 00111_2$, $-M = 11001_2$. Multiplier $Q = -3 = 11101_2$. Accumulator $A = 00000_2, Q_{-1} = 0$.
Result: $A Q = 1111101011_2 = -21_{10}$ (Verified Correct).`;
    }

    if (subjectCode === "CSE1002") {
      return `### Official Model Solution & Evaluation Scheme — ${paperTitle}
**Subject Code:** ${subjectCode} | **Academic Year:** ${examYear} | **Type:** ${examType}

---

#### Q1: Mesh Analysis Solution [10 Marks]
Applying KVL around the two independent loops:
$$Loop 1: \; 10 - 2 I_1 - 4(I_1 - I_2) = 0 \implies 6 I_1 - 4 I_2 = 10$$
$$Loop 2: \; -4(I_2 - I_1) - 6 I_2 - 5 = 0 \implies -4 I_1 + 10 I_2 = -5$$
Solving simultaneously:
$$I_1 = 1.818\text{ A}, \quad I_2 = 0.227\text{ A}$$
Current through shared $4\,\Omega$ resistor: $I = I_1 - I_2 = 1.591\text{ A}$.

---

#### Q2: Full-Wave Bridge Rectifier Ripple Factor [5 Marks]
$$\gamma = \sqrt{\left(\frac{V_{rms}}{V_{dc}}\right)^2 - 1} = \sqrt{\left(\frac{0.707 V_m}{0.637 V_m}\right)^2 - 1} = \sqrt{1.233 - 1} = 0.482$$`;
    }

    return `### Model Solution & Faculty Marking Scheme — ${paperTitle}
**Subject Code:** ${subjectCode} | **Academic Year:** ${examYear} | **Type:** ${examType}

---

#### Question 1 (10 Marks): Analytical Derivation
1. State the governing system equation:
   $$\mathcal{L} \{ f(t) \} = \int_0^\infty e^{-st} f(t) \, dt \implies \det(A - \lambda I) = 0$$
2. Compute step-by-step substitutions according to university examination rubric.
3. Validate final numerical dimensions and boundary conditions.`;
  }

  // Question Paper View
  return `### University Examination Question Paper — ${paperTitle}
**Course Code:** ${subjectCode} | **Academic Year:** ${examYear} | **Examination:** ${examType}
**Time Allowed:** 2.5 Hours | **Maximum Marks:** 60 Marks

---

### Section A: Short Answer Questions (5 × 2 = 10 Marks)
1. Define the fundamental governing law for **${subjectCode}** and write its standard formula.
2. State the key differences between theoretical vs practical implementation constraints.
3. What is the time complexity or physical significance of system equilibrium?
4. Explain the primary role of boundary conditions in system stability.
5. Write down the canonical matrix representation or block diagram.

---

### Section B: Analytical Derivations & Numericals (4 × 10 = 40 Marks)
1. **(a)** Formulate the step-by-step analytical proof for the principal theorem of Module 1.
   **(b)** Solve the accompanying numerical with given boundary parameters.
2. Evaluate the performance metrics and compute the efficiency or convergence rate.
3. Draw neat circuit / architectural diagrams and explain component interconnections.
4. Contrast the trade-offs between speed, cost, and complexity for this architecture.

---

### Section C: Comprehensive Application Case Study (1 × 10 = 10 Marks)
Design a real-world engineering solution using the principles covered in Modules 1 through 5, highlighting failure modes and fault-tolerant mitigation strategies.`;
}
