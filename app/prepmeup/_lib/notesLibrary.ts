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
  "matrices-matrix-operations": String.raw`### 1. Matrix Algebra Fundamentals
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
  "elementary-row-operations": String.raw`### 1. Elementary Row Operations (ERO)
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
$$\begin{bmatrix} 1 & 2 & -1 & 3 \\ 0 & 0 & 3 & -8 \\ 0 & 0 & 6 & -16 \end{bmatrix} \xrightarrow{R_3 \to R_3 - 2R_2} \begin{bmatrix} 1 & 2 & -1 & 3 \\ 0 & 0 & 3 & -8 \\ 0 & 0 & 0 & 0 \end{bmatrix}$$
There are $2$ non-zero rows, hence $\rho(A) = 2$.`,
  "vector-spaces-subspaces": String.raw`### 1. Vector Space & Subspace Axioms
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
  "rank-and-inverse-matrix": String.raw`### 1. Rank of a Matrix $\rho(A)$
The rank of a matrix $A$ is the maximum number of linearly independent rows (or columns) in $A$:
$$\rho(A) = \dim(\text{Col}(A)) = \dim(\text{Row}(A))$$

---

### 2. Gauss-Jordan Inversion Algorithm
To compute $A^{-1}$, augment $A$ with the identity matrix $I_n$:
$$[A \mid I_n] \xrightarrow{\text{Elementary Row Operations}} [I_n \mid A^{-1}]$$

**Solved Numerical:** Find inverse of $A = \begin{bmatrix} 1 & 1 & 1 \\ 1 & 2 & 3 \\ 1 & 4 & 9 \end{bmatrix}$.
$$[A \mid I] = \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 1 & 2 & 3 & \mid & 0 & 1 & 0 \\ 1 & 4 & 9 & \mid & 0 & 0 & 1 \end{bmatrix}$$
$$R_2 \to R_2 - R_1, \; R_3 \to R_3 - R_1 \implies \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 0 & 1 & 2 & \mid & -1 & 1 & 0 \\ 0 & 3 & 8 & \mid & -1 & 0 & 1 \end{bmatrix}$$
$$R_3 \to R_3 - 3R_2 \implies \begin{bmatrix} 1 & 1 & 1 & \mid & 1 & 0 & 0 \\ 0 & 1 & 2 & \mid & -1 & 1 & 0 \\ 0 & 0 & 2 & \mid & 2 & -3 & 1 \end{bmatrix}$$
$$R_3 \to \frac{1}{2} R_3 \implies R_3 = \begin{bmatrix} 0 & 0 & 1 & \mid & 1 & -1.5 & 0.5 \end{bmatrix}$$
Back-clearing upper triangular entries yields:
$$A^{-1} = \begin{bmatrix} 3 & -2.5 & 0.5 \\ -3 & 4 & -1 \\ 1 & -1.5 & 0.5 \end{bmatrix}$$`,
  "system-linear-equations": String.raw`### 1. Rouché-Capelli Consistency Theorem
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
  "eigenvalues-and-diagonalization": String.raw`### 1. Characteristic Equation & Eigenvalues
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
  "partial-derivatives": String.raw`### 1. First & Higher-Order Partial Derivatives
For a multivariable function $z = f(x, y)$:
$$\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h, y) - f(x, y)}{h}, \quad \frac{\partial f}{\partial y} = \lim_{k \to 0} \frac{f(x, y+k) - f(x, y)}{k}$$

By **Clairaut's / Schwarz's Theorem**, if second-order partials are continuous:
$$\frac{\partial^2 f}{\partial x \partial y} = \frac{\partial^2 f}{\partial y \partial x}$$

---

### 2. Multivariable Chain Rule
If $z = f(u, v)$ where $u = g(x, y)$ and $v = h(x, y)$:
$$\frac{\partial z}{\partial x} = \frac{\partial z}{\partial u}\frac{\partial u}{\partial x} + \frac{\partial z}{\partial v}\frac{\partial v}{\partial x}$$
$$\frac{\partial z}{\partial y} = \frac{\partial z}{\partial u}\frac{\partial u}{\partial y} + \frac{\partial z}{\partial v}\frac{\partial v}{\partial y}$$`,
  "eulers-theorem-homogeneous": String.raw`### 1. Definition of Homogeneous Function
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
  "maxima-minima-2var": String.raw`### 1. Stationary Points
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
  "lagrange-multipliers": String.raw`### 1. Method of Lagrange Multipliers
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
  "first-order-linear-odes": String.raw`### 1. Standard Linear Differential Equation
$$\frac{dy}{dx} + P(x) y = Q(x)$$
where $P(x)$ and $Q(x)$ are continuous functions of $x$ alone.

---

### 2. Integrating Factor (I.F.) & General Solution
$$I.F. = e^{\int P(x) , dx}$$
The general solution is:
$$y \cdot (I.F.) = \int Q(x) \cdot (I.F.) , dx + C$$

---

### 3. Worked Example
Solve $(1+x^2)\frac{dy}{dx} + 2xy = 4x^2$:
1. Divide by $1+x^2$: $\frac{dy}{dx} + \frac{2x}{1+x^2} y = \frac{4x^2}{1+x^2}$.
2. $I.F. = e^{\int \frac{2x}{1+x^2} dx} = e^{\ln(1+x^2)} = 1+x^2$.
3. General solution:
   $$y(1+x^2) = \int \frac{4x^2}{1+x^2} (1+x^2) , dx = \int 4x^2 , dx = \frac{4}{3} x^3 + C$$
   $$y = \frac{4x^3}{3(1+x^2)} + \frac{C}{1+x^2}$$`,
  "bernoulli-differential-equations": String.raw`### 1. Bernoulli's Non-Linear Form
$$\frac{dy}{dx} + P(x) y = Q(x) y^n \quad (n \neq 0, 1)$$

---

### 2. Reduction to Linear Equation
Divide by $y^n$:
$$y^{-n} \frac{dy}{dx} + P(x) y^{1-n} = Q(x)$$
Substitute $u = y^{1-n} \implies \frac{du}{dx} = (1-n) y^{-n} \frac{dy}{dx}$:
$$\frac{du}{dx} + (1-n) P(x) u = (1-n) Q(x)$$
Solved via standard integrating factor $I.F. = e^{\int (1-n)P(x) dx}$.`,
  "exact-differential-equations": String.raw`### 1. Condition for Exactness
The differential equation $M(x, y) dx + N(x, y) dy = 0$ is **exact** iff:
$$\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}$$

---

### 2. Solution Formula
$$\int_{y = \text{constant}} M , dx + \int (\text{terms of } N \text{ not containing } x) , dy = C$$

---

### 3. Integrating Factors for Inexact ODEs
- If $\frac{1}{N}\left(\frac{\partial M}{\partial y} - \frac{\partial N}{\partial x}\right) = f(x)$, then $I.F. = e^{\int f(x) dx}$.
- If $\frac{1}{M}\left(\frac{\partial N}{\partial x} - \frac{\partial M}{\partial y}\right) = g(y)$, then $I.F. = e^{\int g(y) dy}$.
- If $M dx + N dy = 0$ is homogeneous and $Mx + Ny \neq 0$, then $I.F. = \frac{1}{Mx + Ny}$.`,
  "double-integrals": String.raw`### 1. Double Integrals over Rectangles
$$\iint_R f(x, y) , dA = \int_a^b \left( \int_c^d f(x, y) , dy \right) dx = \int_c^d \left( \int_a^b f(x, y) , dx \right) dy$$

---

### 2. Change of Order of Integration
Evaluate $I = \int_0^1 \int_x^1 \frac{\sin y}{y} , dy , dx$:
The integration region is $0 \le x \le y \le 1$.
Changing order of integration:
$$I = \int_0^1 \left( \int_0^y \frac{\sin y}{y} , dx \right) dy = \int_0^1 \left[ \frac{\sin y}{y} x \right]_0^y dy = \int_0^1 \sin y , dy = [-\cos y]_0^1 = 1 - \cos 1$$`,
  "vector-differential-operators": String.raw`### 1. The Del Operator (∇)
$$\nabla = \mathbf{i} \frac{\partial}{\partial x} + \mathbf{j} \frac{\partial}{\partial y} + \mathbf{k} \frac{\partial}{\partial z}$$

---

### 2. Gradient of a Scalar Field $\phi(x, y, z)$
$$\nabla \phi = \mathbf{i} \frac{\partial \phi}{\partial x} + \mathbf{j} \frac{\partial \phi}{\partial y} + \mathbf{k} \frac{\partial \phi}{\partial z}$$
- $\nabla \phi$ is a normal vector to the level surface $\phi(x, y, z) = C$.
- The **directional derivative** in direction of unit vector $\mathbf{\hat{u}}$ is $D_{\mathbf{\hat{u}}}\phi = \nabla\phi \cdot \mathbf{\hat{u}}$.`,
  "divergence-and-curl": String.raw`### 1. Divergence of Vector Field $\mathbf{V}$
$$\text{div } \mathbf{V} = \nabla \cdot \mathbf{V} = \frac{\partial V_1}{\partial x} + \frac{\partial V_2}{\partial y} + \frac{\partial V_3}{\partial z}$$
- If $\nabla \cdot \mathbf{V} = 0$, the vector field is **solenoidal** (incompressible fluid flow).

---

### 2. Curl of Vector Field $\mathbf{V}$
$$\text{curl } \mathbf{V} = \nabla \times \mathbf{V} = \begin{vmatrix} \mathbf{i} & \mathbf{j} & \mathbf{k} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ V_1 & V_2 & V_3 \end{vmatrix}$$
- If $\nabla \times \mathbf{V} = \mathbf{0}$, the vector field is **irrotational** (conservative, $\mathbf{V} = \nabla \phi$).\`,

  // ==========================================
  // CSE1002: BASIC ELECTRICAL AND ELECTRONICS ENGINEERING
  // ==========================================`,
  "kirchhoffs-laws": String.raw`### 1. Kirchhoff's Current Law (KCL)
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
  "thevenin-norton-theorems": String.raw`### 1. Thevenin's Theorem
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
  "superposition-and-mpt": String.raw`### 1. Superposition Theorem
In any linear bilateral network containing multiple independent sources, the response in any branch is the algebraic sum of the responses caused by each independent source acting alone:
$$I = I^{(1)} + I^{(2)} + \dots + I^{(n)}$$

---

### 2. Maximum Power Transfer (MPT) Theorem
A resistive load $R_L$ connected across a linear network receives maximum power when the load resistance equals the Thevenin resistance:
$$R_L = R_{th}$$

**Maximum Power Formula:**
$$P_{\max} = I_L^2 R_L = \left(\frac{V_{th}}{2 R_{th}}\right)^2 R_{th} = \frac{V_{th}^2}{4 R_{th}}$$
Efficiency under maximum power transfer is strictly $\eta = 50\%$.`,
  "pn-junction-characteristics": String.raw`### 1. PN Junction Diode V-I Characteristics
The Shockley diode equation models current flow:
$$I = I_0 \left( e^{\frac{q V}{\eta k T}} - 1 \right) = I_0 \left( e^{\frac{V}{\eta V_T}} - 1 \right)$$
where $V_T = \frac{kT}{q} \approx 26\text{ mV}$ at room temperature ($300\text{ K}$), $\eta = 1$ for Ge, $\eta = 2$ for Si.

- **Forward Bias:** Cut-in / Knee voltage:
  - Silicon ($Si$): $V_\gamma \approx 0.7\text{ V}$
  - Germanium ($Ge$): $V_\gamma \approx 0.3\text{ V}$
- **Reverse Bias:** Tiny reverse saturation current $I_0$ ($nA$ for Si, $\mu A$ for Ge) until reaching the Zener/Avalanche breakdown voltage.`,
  "rectifiers-and-filters": String.raw`### 1. Half-Wave vs Full-Wave Rectifiers Comparison

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
  "zener-voltage-regulator": String.raw`### 1. Zener Diode Working Principle
A Zener diode is a heavily doped PN junction diode designed to operate stably in the **reverse breakdown region** where voltage remains constant ($V_Z$) across a wide variation of current $I_Z$.

---

### 2. Voltage Regulator Design Equation
- Series current limiting resistor $R_S$:
  $$R_S = \frac{V_{\text{in}} - V_Z}{I_Z + I_L}$$
- Maximum and Minimum Zener Current:
  $$I_{Z,\min} \le I_Z \le I_{Z,\max} = \frac{P_{Z,\max}}{V_Z}$$`,
  "bjt-configurations": String.raw`### 1. BJT Terminals & Operation
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
  "bjt-switch-amplifier": String.raw`### 1. BJT as an Electronic Switch
- **Cutoff Region (OFF state):** $V_{BE} < 0.7\text{V}, \; I_B = 0, \; I_C = 0, \; V_{CE} = V_{CC}$.
- **Saturation Region (ON state):** Both BE and BC junctions forward biased, $V_{CE(\text{sat})} \approx 0.2\text{V}, \; I_{C(\text{sat})} = \frac{V_{CC} - 0.2}{R_C}$.

---

### 2. Common Emitter (CE) Amplifier
- Input applied to Base, output taken from Collector.
- Phase Inversion: 180° phase shift between input and output AC signals.`,
  "mosfet-and-cmos": String.raw`### 1. MOSFET Operation
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
  "ideal-opamp-characteristics": String.raw`### 1. Ideal Operational Amplifier Characteristics
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
  "inverting-non-inverting-opamp": String.raw`### 1. Inverting Amplifier
$$V_o = -\frac{R_f}{R_1} V_{\text{in}}$$
$$\text{Gain } A_v = -\frac{R_f}{R_1}$$

---

### 2. Non-Inverting Amplifier
$$V_o = \left( 1 + \frac{R_f}{R_1} \right) V_{\text{in}}$$
$$\text{Gain } A_v = 1 + \frac{R_f}{R_1} \ge 1$$`,
  "opamp-applications": String.raw`### 1. Summing Amplifier
$$V_o = -R_f \left( \frac{V_1}{R_1} + \frac{V_2}{R_2} + \frac{V_3}{R_3} \right)$$

---

### 2. Integrator & Differentiator
- **Integrator:** $V_o(t) = -\frac{1}{RC} \int_0^t V_{\text{in}}(\tau) , d\tau$
- **Differentiator:** $V_o(t) = -RC \frac{dV_{\text{in}}(t)}{dt}$`,
  "beee-lab-exp-1": String.raw`### BEEE Lab — Experiment 1: Component Identification & DMM Testing
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
  "beee-lab-exp-2": String.raw`### BEEE Lab — Experiment 2: Verification of KVL and KCL
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
  "beee-lab-exp-3": String.raw`### BEEE Lab — Experiment 3: PN Junction Diode V-I Characteristics
**Aim:** To plot the forward and reverse bias V-I characteristics of a Silicon PN junction diode (1N4007) and determine cut-in voltage and dynamic resistance.

---

### 1. Forward Bias Measurements
- Knee / Cut-In Voltage: $V_\gamma = 0.70\text{ V}$.
- Dynamic (AC) Forward Resistance:
  $$r_d = \frac{\Delta V_F}{\Delta I_F} \approx \frac{0.75 - 0.70}{(25 - 10) \times 10^{-3}} = \frac{0.05}{15 \times 10^{-3}} \approx 3.33,\Omega$$`,
  "beee-lab-exp-4": String.raw`### BEEE Lab — Experiment 4: Half-Wave Rectifier with Capacitor Filter
**Aim:** To construct a half-wave rectifier, observe input/output waveforms on CRO, and calculate DC voltage, RMS voltage, and ripple factor.

---

### 1. Circuit Equations
Given peak voltage $V_m = 15\text{ V}$:
$$V_{dc} = \frac{V_m}{\pi} = 4.77\text{ V}, \quad V_{rms} = \frac{V_m}{2} = 7.50\text{ V}$$
$$\text{Ripple Factor } \gamma = \sqrt{\left(\frac{7.50}{4.77}\right)^2 - 1} = 1.21$$
Adding filter capacitor $C = 100,\mu\text{F}$ reduces ripple factor to $\gamma < 0.1$.`,
  "beee-lab-exp-5": String.raw`### BEEE Lab — Experiment 5: Center-Tap & Bridge Full-Wave Rectifiers
**Aim:** To construct and compare center-tap and bridge full-wave rectifiers with a half-wave rectifier.

---

### 1. Comparative Observations
- Rectification Efficiency: $\eta = 81.2\%$ (twice that of half-wave rectifier).
- Unfiltered Ripple Factor: $\gamma = 0.482$.
- Peak Inverse Voltage (Bridge): $V_m$ (Center-tap requires $2V_m$).\`,

  // ==========================================
  // CSE1003: COMPUTER ORGANIZATION AND ARCHITECTURE
  // ==========================================`,
  "von-neumann-vs-harvard": String.raw`### 1. Architecture Comparison (COA Assignment 1, Q2)

| Feature | Von Neumann Architecture | Harvard Architecture |
| :--- | :--- | :--- |
| **Bus Structure** | Single shared bus for instructions & data | Separate physical address/data buses for instructions & data |
| **Execution** | Instruction fetch and data read cannot occur concurrently | Simultaneous instruction fetch and memory data operand access |
| **Bottleneck** | **Von Neumann Bottleneck** limits throughput | Bottleneck eliminated through isolated memory paths |
| **Hardware** | Simpler CPU layout, lower pin count | Complex routing, higher pin count and separate cache controllers |
| **Usage** | General desktop CPUs (Intel x86, AMD64) | DSP processors, microcontrollers (AVR, PIC, ARM Cortex-M) |`,
  "eight-great-ideas-architecture": String.raw`### Eight Great Ideas in Computer Architecture (COA Assignment 1, Q3)
1. **Design for Moore's Law:** Anticipate future transistor counts during long design cycles.
2. **Use Abstraction to Simplify Design:** Modular hardware hierarchy hiding lower circuit gates.
3. **Make the Common Case Fast:** Optimize instructions executed >80% of time (Amdahl's Law).
4. **Performance via Parallelism:** Execute simultaneous operations via SIMD/multicore.
5. **Performance via Pipelining:** Overlap instruction stages (Fetch, Decode, Execute).
6. **Performance via Prediction:** Speculative branch execution rather than waiting for stall.
7. **Hierarchy of Memories:** Fast small L1/L2 caches backing larger slower DRAM.
8. **Dependability via Redundancy:** ECC memory and RAID disks to prevent catastrophic system crash.`,
  "booths-multiplication-algorithm": String.raw`### 1. Booth's Multiplication Algorithm
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
  "ieee-754-floating-point": String.raw`### 1. Single-Precision Format (32-bit Standard)
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
  "isa-and-instruction-types": String.raw`### 1. Instruction Set Architecture (COA Assignment 2, Q1 & Q2)
ISA defines the programmer-visible interface to hardware: registers, instructions, addressing modes, and exception mechanisms.

---

### 2. Classification by Operand Address Count
- **3-Address:** \`ADD R1, R2, R3\` ($R_1 \leftarrow R_2 + R_3$).
- **2-Address:** \`ADD R1, R2\` ($R_1 \leftarrow R_1 + R_2$).
- **1-Address (Accumulator):** \`ADD X\` ($AC \leftarrow AC + M[X]$).
- **0-Address (Stack Architecture):** \`ADD\` (Pops top two operands from stack and pushes sum).`,
  "addressing-modes-and-rtl": String.raw`### 1. Register Transfer Language (RTL) (COA Assignment 2, Q3)
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
  "risc-vs-cisc-architecture": String.raw`### RISC vs CISC Architecture Comparison (COA Assignment 2, Q9)

| Characteristic | RISC (Reduced Instruction Set Computer) | CISC (Complex Instruction Set Computer) |
| :--- | :--- | :--- |
| **Instruction Size** | Fixed length (typically 32-bit) | Variable length (1 to 15 bytes) |
| **Execution Speed** | Single-cycle execution per instruction | Multi-cycle execution |
| **Memory Access** | Strictly load/store architecture (\`LOAD\`, \`STORE\`) | Memory operands allowed directly in ALU operations |
| **Control Unit** | Hardwired control logic (high speed) | Microprogrammed control store (ROM) |
| **Registers** | Large register file ($32-128$ GPRs) | Fewer general-purpose registers ($8-16$) |
| **Examples** | ARM, RISC-V, MIPS | Intel x86, AMD64 |`,
  "pipelining-and-hazards": String.raw`### 1. Classic 5-Stage RISC Instruction Pipeline
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
  "memory-hierarchy-design": String.raw`### 1. Memory Hierarchy Triangle
1. **CPU Registers:** $0.5\text{ ns}$, $< 1\text{ KB}$, on-chip.
2. **L1 Cache (Split I/D):** $1\text{ ns}$, $32-64\text{ KB}$, on-chip SRAM.
3. **L2 Cache:** $3-5\text{ ns}$, $512\text{ KB}-2\text{ MB}$, SRAM.
4. **L3 Cache:** $10-20\text{ ns}$, $8-32\text{ MB}$, shared SRAM.
5. **Main Memory (DRAM):** $50-100\text{ ns}$, $8-64\text{ GB}$, off-chip DRAM.
6. **Secondary Storage (SSD/NVMe):** $10-50, \mu\text{s}$, $512\text{ GB}-2\text{ TB}$, Flash.

---

### 2. Average Memory Access Time (AMAT)
$$\text{AMAT} = \text{Hit Time} + (\text{Miss Rate} \times \text{Miss Penalty})$$`,
  "cache-mapping-techniques": String.raw`### 1. Cache Mapping Mechanisms
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
  "cache-replacement-and-write-policies": String.raw`### 1. Cache Replacement Policies
- **LRU (Least Recently Used):** Evicts line that has not been referenced for the longest time.
- **FIFO (First-In, First-Out):** Evicts oldest line loaded.
- **LFU (Least Frequently Used):** Evicts line with smallest access count.

---

### 2. Cache Write Policies
- **Write-Through:** Memory updated simultaneously on every cache write.
- **Write-Back:** Data written only to cache line with **Dirty Bit** set. Main memory updated only when dirty line is evicted.\`,

  // ==========================================
  // CSE1004: FUNDAMENTALS OF WEB TECHNOLOGIES
  // ==========================================`,
  "web-evolution-and-arpanet": String.raw`### 1. Milestones of Web Evolution
- **1969 — ARPANET:** First packet-switching network utilizing Interface Message Processors (IMPs).
- **1989 — CERN & Tim Berners-Lee:** Invention of HTML, HTTP, and URLs to link scientific documents.
- **Web 1.0 (1991–2004):** Static HTML read-only web.
- **Web 2.0 (2004–Present):** Participatory, user-generated content, AJAX, Web APIs, single page applications.
- **Web 3.0:** Semantic data graphs, decentralization, cryptographic verification.`,
  "client-server-and-dns": String.raw`### 1. Client-Server Architecture
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
  "http-https-status-codes": String.raw`### 1. HTTP Methods
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
  "html5-semantic-elements": String.raw`### 1. Semantic HTML5 Elements
Semantic tags convey meaning to browsers, search engines, and screen readers:
- \`<header>\`: Introductory content or navigational links.
- \`<nav>\`: Set of primary site navigation links.
- \`<main>\`: Dominant content unique to the document.
- \`<article>\`: Self-contained independent composition.
- \`<section>\`: Thematic grouping of content with heading.
- \`<aside>\`: Tangentially related content.
- \`<footer>\`: Author, copyright, legal disclaimer.`,
  "html-lists-tables-forms": String.raw`### 1. HTML Lists (Practical 2)
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
  "css-box-model-selectors": String.raw`### 1. CSS Box Model
$$\text{Total Width} = \text{Content Width} + \text{Padding} + \text{Border} + \text{Margin}$$
Using \`box-sizing: border-box\` causes specified width and height to include content, padding, and border.

---

### 2. Specificity Hierarchy
$$\text{Inline Styles } (1000) > \text{IDs } (100) > \text{Classes, Attributes, Pseudo-classes } (10) > \text{Elements } (1)$$`,
  "css-flexbox-and-grid": String.raw`### 1. CSS Flexbox (1-Dimensional Layout)
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
\`\`\`\`,

  // ==========================================
  // CSE1005: PYTHON PROGRAMMING
  // ==========================================`,
  "python-architecture-features": String.raw`### 1. Key Features of Python
- **High-Level & Interpreted:** Executes via bytecode on the Python Virtual Machine (PVM).
- **Dynamically Typed:** Variable types are bound at runtime without explicit declarations.
- **Automatic Garbage Collection:** Reference counting augmented with cyclic garbage collector.
- **Multi-Paradigm:** Supports procedural, object-oriented, and functional programming.`,
  "conditional-statements-ternary": String.raw`### 1. Control Flow & Branching
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
  "loops-and-control-flow": String.raw`### 1. Loop Control Statements
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
  "functions-args-kwargs-recursion": String.raw`### 1. Arbitrary Arguments (*args, **kwargs)
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
  "strings-and-string-methods": String.raw`### 1. String Slicing & Immutability
Strings are immutable ordered sequences of Unicode characters:
- Slicing syntax: \`s[start : stop : step]\`
- Reverse string idiom: \`s[::-1]\`

\`\`\`python
s = "DYPIU University"
print(s.lower())         # dypiu university
print(s.split(" "))      # ['DYPIU', 'University']
print("-".join(["2026", "Sem1"]))  # 2026-Sem1
\`\`\``,
  "lists-tuples-comprehensions": String.raw`### 1. Lists vs Tuples
- **List:** Mutable sequence defined with \`[ ]\`. Methods: \`append()\`, \`extend()\`, \`insert()\`, \`pop()\`, \`sort()\`.
- **Tuple:** Immutable sequence defined with \`( )\`. Supports tuple packing and unpacking.

---

### 2. List Comprehension Syntax
$$\text{new\_list} = [\text{expression} \; \textbf{for} \; \text{item} \; \textbf{in} \; \text{iterable} \; \textbf{if} \; \text{condition}]$$

\`\`\`python
squares = [x**2 for x in range(1, 11) if x % 2 == 0]
# [4, 16, 36, 64, 100]
\`\`\``,
  "dictionaries-and-sets": String.raw`### 1. Dictionary Hash Tables
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
  "numpy-basics-vectorization": String.raw`### 1. NumPy ndarrays & Vectorized Operations
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
  "pandas-dataframes-operations": String.raw`### 1. Pandas Series & DataFrames
\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "PRN": [101, 102, 103],
    "Score": [88, 95, 72]
})

# Filter students with Score > 80:
top = df[df["Score"] > 80]
mean_score = df["Score"].mean()
\`\`\`\`,

  // ==========================================
  // CSE1006: INDIAN KNOWLEDGE SYSTEMS (IKS)
  // ==========================================`,
  "iks-framework-foundations": String.raw`### 1. 14 Vidyasthanas of Ancient India
The Indian Knowledge System is historically structured into **14 Vidyasthanas**:
- **4 Vedas:** Rigveda, Yajurveda, Samaveda, Atharvaveda.
- **6 Vedangas:** Shiksha (Phonetics), Kalpa (Ritual/Geometry), Vyakarana (Grammar), Nirukta (Etymology), Chandas (Metre), Jyotisha (Astronomy/Mathematics).
- **4 Upangas:** Mimamsa (Interpretation), Nyaya (Epistemology & Logic), Purana (History/Cosmology), Dharma Shastra (Jurisprudence).`,
  "panini-ashtadhyayi-linguistics": String.raw`### 1. Panini's Formal Grammar System
Composed in 4th century BCE, the *Ashtadhyayi* contains ~4,000 algorithmic sutras formalizing Sanskrit phonology and syntax.
- **Anticipation of BNF:** Noam Chomsky and Leonard Bloomfield recognized Panini's meta-rules as the precursor to **Backus-Naur Form (BNF)** used in modern compiler grammars.
- **Sivasutras:** 14 aphorisms organizing sounds into sound classes using auxiliary markers (*it* symbols) analogous to modern regular expressions.`,
  "sulba-sutras-and-aryabhata": String.raw`### 1. Baudhayana's Theorem in Sulba Sutras (800 BCE)
$$a^2 + b^2 = c^2$$
*The diagonal of a rectangle produces by itself both the areas which the length and breadth produce separately.* (Pre-dates Pythagoras by centuries).

---

### 2. Aryabhata's Contributions (499 CE)
- **Place Value & Shunya (Zero):** Developed decimal system and algorithmic operations.
- **Approximation of Pi:** $\pi \approx \frac{62832}{20000} = 3.1416$.
- **Astronomy:** Identified that the Earth rotates on its axis and planetary orbits are elliptical.`,
  "indian-metallurgy-wootz-steel": String.raw`### 1. Ancient Metallurgy Achievements
- **Wootz Steel (Ukku):** High-carbon crucible steel manufactured in Southern India, exported worldwide to make Damascus blades.
- **Delhi Iron Pillar (4th Century CE):** 6-tonne forged wrought iron column standing rust-free for >1600 years due to protective *misawite* ($\delta$-FeOOH) catalytic layer formed from high phosphorus slag.
- **Zinc Smelting at Zawar (Rajasthan):** First industrial distillation process using downward retorts (12th Century).`,
  "virtual-memory-and-tlb": String.raw`### 1. Virtual Memory Architecture & Address Translation
Virtual memory creates an illusion of a large, contiguous physical memory address space by mapping virtual addresses generated by the CPU to physical frame addresses in DRAM or secondary swap storage:
$$\text{Virtual Address (VA)} = \langle \text{Virtual Page Number (VPN)}, \text{Page Offset} \rangle$$
$$\text{Physical Address (PA)} = \langle \text{Physical Frame Number (PFN)}, \text{Page Offset} \rangle$$

- **Page Size ($P$):** Typically $4\text{ KB} = 2^{12}\text{ bytes}$, meaning page offset is $12\text{ bits}$.
- **Translation Lookaside Buffer (TLB):** A high-speed, fully associative or set-associative hardware cache storing recent $\text{VPN} \to \text{PFN}$ translations to avoid two memory accesses per instruction.

---

### 2. Effective Memory Access Time (EMAT)
Let $h$ be the TLB hit ratio, $t_{\text{TLB}}$ be the TLB access time, and $t_{\text{mem}}$ be the main memory access time:
$$\text{EMAT} = h \cdot (t_{\text{TLB}} + t_{\text{mem}}) + (1 - h) \cdot (t_{\text{TLB}} + 2 \cdot t_{\text{mem}})$$
If a page fault occurs with probability $p$ and page fault service time $t_{\text{fault}}$:
$$\text{EMAT}_{\text{fault}} = (1 - p) \cdot t_{\text{mem}} + p \cdot t_{\text{fault}}$$

---

### 3. Solved Numerical Problem
**Problem:** In a paging system, TLB access time is $20\text{ ns}$, memory access time is $100\text{ ns}$, and TLB hit ratio is $95\%$. Calculate EMAT.
$$\text{EMAT} = 0.95 \cdot (20 + 100) + 0.05 \cdot (20 + 200) = 0.95(120) + 0.05(220) = 114 + 11 = 125\text{ ns}$$

---

### 4. Common Exam Pitfalls
- **Offset Modification:** Page offset is NEVER modified during address translation; only the VPN is replaced by the PFN.
- **Inverted Page Tables:** In 64-bit architectures, standard page tables grow too large, requiring hashed or inverted page tables indexed by PFN rather than VPN.

---

### 5. University Model Exam Questions
**Q1 [5 Marks]:** Explain the steps performed by the OS and MMU on a TLB miss and subsequent page fault.
- **Model Answer:**
  1. MMU checks TLB; on miss, walks the page table in memory (Page Table Walk).
  2. If the Present/Valid bit in the Page Table Entry (PTE) is 0, a **Page Fault Exception** (trap) is raised.
  3. OS handles trap: saves process state, locates page on swap disk, finds free physical frame (evicting a page via LRU if necessary).
  4. Disk controller transfers page into frame via DMA.
  5. OS updates PTE with new PFN, sets valid bit, updates TLB, and restarts the faulting instruction.`,
  "programmed-vs-interrupt-io": String.raw`### 1. I/O Synchronization Paradigms
Microprocessors interface with peripheral devices using three primary synchronization mechanisms:
1. **Programmed I/O (Polling):**
   - The CPU continuously interrogates the status register of the I/O module in a busy-waiting loop (\`busy-wait\`) until the device is ready.
   - *CPU Overhead:* $\eta_{\text{CPU}} \approx 100\%$ wasted waiting for slow electromechanical peripherals.
2. **Interrupt-Driven I/O:**
   - The CPU issues an I/O command and continues executing unrelated user processes.
   - When the peripheral finishes, it asserts an asynchronous hardware interrupt request line (\`INTR\`).
   - The CPU acknowledges (\`INTA\`), preserves its program counter and status registers on the stack, and branches to the **Interrupt Service Routine (ISR)**.

---

### 2. Comparison Matrix

| Feature | Programmed I/O | Interrupt-Driven I/O |
| :--- | :--- | :--- |
| **CPU Utilization** | Low (CPU tied to polling loop) | High (CPU released during device latency) |
| **Hardware Complexity**| Minimal (Single status flip-flop) | Higher (Priority encoder, INTR/INTA lines, PIC) |
| **Response Latency** | Predictable but slow throughput | Immediate response on interrupt trigger |
| **Ideal For** | High-speed dedicated controllers | Keyboards, mice, asynchronous network packets |

---

### 3. Daisy-Chaining & Priority Interrupts
- **Daisy-Chain Priority:** Hardware devices are wired in series. The device closest to the interrupt controller possesses the highest priority and intercepts the \`INTA\` daisy-chain signal first.
- **Vectored vs Non-Vectored:**
  - *Vectored:* Device supplies an 8-bit interrupt vector on the data bus pointing directly to the ISR entry address in the Interrupt Vector Table (IVT).
  - *Non-Vectored:* Fixed memory branch address; CPU polls devices in software to identify the requester.`,
  "dma-controllers-modes": String.raw`### 1. Direct Memory Access (DMA) Principles
DMA allows high-speed secondary devices (SSD, NVMe, Ethernet NIC) to transfer bulk data blocks directly to and from system RAM without routing bytes through CPU registers:
- **Bus Mastership:** The DMA Controller (DMAC, e.g., Intel 8237) asserts \`HOLD\` to request the system bus. The CPU finishes its current bus cycle and asserts \`HLDA\` (Hold Acknowledge), floating its address and data buses in high-impedance ($Z$) state.
- **Internal Registers:**
  1. *Address Register:* Holds the destination/source memory base address.
  2. *Word Count Register:* Initialized with block length $N$; decrements with each word transferred.
  3. *Control & Status Registers:* Configure direction (read/write) and transfer mode.

---

### 2. DMA Transfer Modes
1. **Burst Mode (Block Transfer):**
   - The DMAC retains control of the system bus continuously until the entire data block is transferred.
   - *Throughput:* Maximum transfer speed; CPU is starved of bus access for the entire burst duration.
2. **Cycle Stealing Mode:**
   - The DMAC takes control of the bus for exactly one bus cycle per transferred word and yields it back to the CPU between words.
   - *Throughput:* Balances I/O throughput with CPU execution continuity.
3. **Transparent (Hidden) Mode:**
   - The DMAC monitors CPU internal states and executes transfers strictly when the CPU is decoding instructions or utilizing internal registers without needing the external bus. Zero CPU impact.

---

### 3. Solved Problem
**Problem:** A disk transfers data at $10\text{ MB/s}$. The memory bus cycle time is $100\text{ ns}$ for $32\text{ bit}$ ($4\text{ byte}$) words. What percentage of CPU bus cycles are stolen?
- Words per second $= \frac{10 \times 10^6\text{ B}}{4\text{ B}} = 2.5 \times 10^6\text{ transfers/sec}$.
- Bus time required $= 2.5 \times 10^6 \times 100 \times 10^{-9}\text{ s} = 0.25\text{ s}$.
- Cycle stealing percentage $= 25\%$. The CPU runs at $75\%$ efficiency.`,
  "bus-structures-arbitration": String.raw`### 1. System Bus Topologies
A computer bus is a shared communication pathway consisting of:
- **Control Bus:** Carries read/write strobes, interrupt acknowledgments, and clock synchronization lines.
- **Address Bus:** Unidirectional bus carrying physical addresses; width ($k$ bits) defines addressable memory $2^k$.
- **Data Bus:** Bidirectional bus carrying instruction and data operands; width ($w$ bits) determines word size.

---

### 2. Bus Arbitration Schemes
When multiple bus masters (multiple CPU cores, DMAC, GPU) demand bus control concurrently, arbitration decides grant priority:
1. **Centralized Arbitration:**
   - *Daisy Chaining:* Single Bus Request line (\`BR\`) shared by all masters. Bus Grant (\`BG\`) propagates sequentially. Simple, but lower-priority masters risk starvation, and upstream failure disconnects downstream devices.
   - *Independent Request / Grant:* Each master has dedicated $BR_i$ and $BG_i$ lines connected to a central arbiter. Fast, programmable priority (LRU, Round-Robin), but requires $2N$ arbitration pins.
2. **Distributed (Decentralized) Arbitration:**
   - Masters share common arbitration lines. Each master assigns itself a unique ID and resolves contention without a single point of failure using open-collector wired-OR priority encoding.

---

### 3. Synchronous vs Asynchronous Buses
- **Synchronous Bus:** Includes an explicit clock signal. All bus cycles occur at fixed multiples of clock cycles. High speed, short distances.
- **Asynchronous Bus:** Handshake-based protocol (\`Request\` $\to$ \`Ready\` $\to$ \`Ack\`). Accommodates peripherals of varying speeds without fixed clock constraints.`,
  "flynns-classification": String.raw`### 1. Flynn's Taxonomy (1966)
Michael J. Flynn categorized computer architectures into four classes based on the multiplicity of Instruction Streams (IS) and Data Streams (DS):

\`\`\`
                        Instruction Streams
                     Single (SI)     Multiple (MI)
Data    Single (SD)     SISD            MISD
Streams Multiple (MD)   SIMD            MIMD
\`\`\`

---

### 2. Detailed Architectural Classes
1. **SISD (Single Instruction, Single Data):**
   - Classical uniprocessor Von Neumann machine (e.g., standard single-core x86/ARM core executing serial sequential instructions).
2. **SIMD (Single Instruction, Multiple Data):**
   - A single control unit issues one vector instruction that operates simultaneously across multiple processing elements on distinct data elements.
   - *Examples:* GPU shader cores, Intel AVX-512, ARM Neon vector units. Ideal for matrix multiplication and image processing.
3. **MISD (Multiple Instruction, Single Data):**
   - Multiple independent instructions operate on the same stream of data.
   - *Application:* Highly specialized fault-tolerant redundant computing (e.g., NASA Space Shuttle flight control systems running voting logic).
4. **MIMD (Multiple Instruction, Multiple Data):**
   - Multiple autonomous processors concurrently execute different instructions on different datasets.
   - *Subclasses:* Distributed clusters, Cloud hypervisors, Symmetric Multiprocessors (SMP), NUMA nodes.

---

### 3. University Model Exam Questions
**Q1 [5 Marks]:** Distinguish between UMA (Uniform Memory Access) and NUMA (Non-Uniform Memory Access) under MIMD.
- **Model Answer:**
  - *UMA (Symmetric Multiprocessors - SMP):* All CPUs share a single memory controller over a common bus; memory latency is uniform for all cores.
  - *NUMA:* Memory is physically partitioned among sockets. Accessing local node memory is fast (~$60\text{ ns}$); accessing remote socket memory over interconnect (QPI/UPI) incurs higher latency (~$140\text{ ns}$).`,
  "multicore-and-shared-memory": String.raw`### 1. Multicore Architecture Principles
As uniprocessor clock frequencies encountered the physical "Power Wall" ($P = \alpha C V^2 f + I_{\text{leak}} V$), microprocessor designers shifted from single-core scaling to chip multiprocessing (CMP):
- **Core Organization:** Multiple independent CPU execution pipelines integrated on a single silicon die.
- **Cache Topology:** Private L1 Instruction and Data caches per core, private or shared L2 caches, and a massive shared L3 Last-Level Cache (LLC).

---

### 2. Amdahl's Law in Multicore Scaling
Let $f$ be the fraction of an algorithm that is strictly parallelizable, and $N$ be the number of execution cores:
$$\text{Speedup}(N) = \frac{1}{(1 - f) + \frac{f}{N}}$$
$$\lim_{N \to \infty} \text{Speedup}(N) = \frac{1}{1 - f}$$

- **Numerical Example:** If $10\%$ of a program is serial ($1 - f = 0.10$), even an infinite number of processor cores can never achieve more than a $10\times$ speedup!

---

### 3. Interconnect Topologies
- **Crossbar Switch:** Non-blocking $N \times M$ matrix providing full point-to-point bandwidth; hardware cost scales as $\mathcal{O}(N^2)$.
- **2D Mesh / Ring Bus:** Used in modern Intel Xeon and AMD EPYC processors for scalable, low-latency packet-switched routing between tiles.`,
  "cache-coherence-mesi": String.raw`### 1. The Cache Coherence Problem
In symmetric multiprocessor (SMP) systems with private write-back caches, multiple copies of the same memory location $\mathbf{X}$ can reside in different L1 caches simultaneously. If Core A writes $\mathbf{X} \leftarrow 42$ while Core B reads $\mathbf{X}$, Core B will read stale data without hardware coherence.

---

### 2. The MESI Snooping Protocol
Every cache line maintains a 2-bit state machine snooping all transactions broadcast on the shared memory bus:
- **Modified (M):** Cache line is present only in this cache and is *dirty* (differs from main memory). This cache owns the line.
- **Exclusive (E):** Cache line is present only in this cache and is *clean* (matches main memory).
- **Shared (S):** Cache line may be present in multiple caches and is *clean*.
- **Invalid (I):** Cache line contains stale or unallocated data.

---

### 3. State Transition Table

| Current State | Local Processor Read | Local Processor Write | Snooped Bus Read | Snooped Bus Write / Invalidate |
| :--- | :--- | :--- | :--- | :--- |
| **I (Invalid)** | Transitions to S or E | Broadcasts BusUpgr/BusRdX $\to$ M | No action | No action |
| **S (Shared)** | Remains in S | Broadcasts BusUpgr $\to$ M | Remains in S | Transitions to **I** |
| **E (Exclusive)**| Remains in E | Transitions to **M** (silent) | Transitions to **S** | Transitions to **I** |
| **M (Modified)** | Remains in M | Remains in M | Writes back to RAM $\to$ **S** | Writes back to RAM $\to$ **I** |

---

### 4. False Sharing Pitfall
When two distinct variables used by different cores reside on the same $64\text{ byte}$ cache line, unnecessary cache invalidations ping-pong between cores, severely degrading multithreaded performance. Solved via cache line padding.`,
  "html5-multimedia-elements": String.raw`### 1. Modern HTML5 Audio & Video Standards
Before HTML5, web multimedia relied on fragile proprietary plugins (Adobe Flash, Silverlight). HTML5 introduced native \`<video>\` and \`<audio>\` elements with browser-level hardware acceleration:

\`\`\`html
<video controls poster="/assets/poster.webp" width="640" height="360" preload="metadata">
  <source src="/media/lecture.mp4" type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'">
  <source src="/media/lecture.webm" type="video/webm; codecs='vp9, opus'">
  <track kind="subtitles" src="/captions/en.vtt" srclang="en" label="English" default>
  <p>Your browser does not support HTML5 video.</p>
</video>
\`\`\`

- **Container Formats vs Codecs:** MP4 is an MPEG-4 Part 14 container; H.264/AVC or H.265/HEVC is the video compression codec; AAC or Opus is the audio codec.
- **Preload Attributes:** \`none\`, \`metadata\` (downloads dimensions and duration only), or \`auto\` (buffers full stream).

---

### 2. The HTML5 \`<canvas>\` 2D Graphics API
The HTML5 \`<canvas>\` element provides a procedural bitmap surface manipulated dynamically via JavaScript:

\`\`\`html
<canvas id="graphCanvas" width="400" height="300" style="border:1px solid #333;"></canvas>
<script>
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  
  // High-DPI Display Compensation
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 400 * dpr;
  canvas.height = 300 * dpr;
  ctx.scale(dpr, dpr);

  // Drawing Path & Vector Shapes
  ctx.strokeStyle = "#ff3b1d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 250);
  ctx.lineTo(200, 50);
  ctx.lineTo(350, 250);
  ctx.closePath();
  ctx.stroke();
</script>
\`\`\`

---

### 3. Canvas vs SVG Comparison
- **Canvas (Immediate Mode):** Pixel-based raster buffer. Fast for rendering tens of thousands of particles, charts, or game loops. No DOM nodes for drawn objects.
- **SVG (Retained Mode):** XML-based vector graphics. Each path is a DOM element accessible via CSS and JavaScript event listeners. Scales infinitely without pixelation.`,
  "responsive-css-media-queries": String.raw`### 1. Responsive Web Design (RWD) Architecture
Responsive Web Design enables web interfaces to adapt fluidly across devices of varying screen resolutions, aspect ratios, and orientations based on three foundational tenets:
1. **Fluid Grids:** Percentage or fractional-unit (\`fr\`) layouts rather than fixed pixel dimensions.
2. **Flexible Images:** \`max-width: 100%; height: auto;\` preventing viewport overflow.
3. **CSS3 Media Queries:** Conditional rule blocks executed based on viewport and device features.

---

### 2. Viewport Meta Configuration
Without setting the viewport meta tag, mobile browsers emulate desktop viewports ($980\text{ px}$) and scale down pages, causing tiny unreadable text:
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
\`\`\`

---

### 3. Modern CSS Media Query Syntax
\`\`\`css
/* Standard Breakpoint Hierarchy (Mobile First Paradigm) */
:root {
  --container-padding: 1rem;
}

/* Small tablets / landscape phones */
@media screen and (min-width: 640px) {
  :root { --container-padding: 1.5rem; }
  .grid-layout { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop Monitors */
@media screen and (min-width: 1024px) {
  :root { --container-padding: 2.5rem; }
  .grid-layout { grid-template-columns: repeat(4, 1fr); }
}

/* Modern Range Syntax (CSS Media Queries Level 4) */
@media (768px <= width <= 1200px) {
  .sidebar { width: 240px; }
}

/* User Preference Queries */
@media (prefers-color-scheme: dark) {
  body { background-color: #08080a; color: #f4f4f6; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
\`\`\`

---

### 4. Common Exam Pitfall
- **Desktop-First vs Mobile-First:** Using \`max-width\` queries represents desktop-first design, resulting in bloated mobile CSS overrides. Industrial production code uses \`min-width\` queries starting from the baseline mobile layout.`,
  "javascript-es6-fundamentals": String.raw`### 1. ECMAScript 2015+ (ES6) Modern Evolution
ECMAScript 6 revolutionized JavaScript into an enterprise-grade programming language with modern lexical scoping, arrow functions, destructuring, and class constructs.

---

### 2. Scoping: \`var\` vs \`let\` vs \`const\`
- **\`var\`:** Function-scoped, hoisted with \`undefined\` initialization, permits duplicate declarations in the same scope, binds to \`window\`.
- **\`let\`:** Block-scoped (\`{ ... }\`), hoisted into the **Temporal Dead Zone (TDZ)** where accessing before initialization throws \`ReferenceError\`.
- **\`const\`:** Block-scoped, immutable reference binding (primitive values cannot be reassigned; object properties remain mutable).

---

### 3. Arrow Functions & Lexical \`this\`
Arrow functions do not bind their own \`this\`, \`arguments\`, \`super\`, or \`new.target\`. They capture the \`this\` value of the enclosing lexical execution context:
\`\`\`javascript
const timer = {
  seconds: 0,
  start() {
    // Arrow function preserves lexical 'this' binding to timer object
    setInterval(() => {
      this.seconds++;
      console.log(\`Elapsed: \${this.seconds}s\`);
    }, 1000);
  }`,
  "dom-manipulation-events": String.raw`### 1. Document Object Model (DOM) Architecture
The DOM is a tree representation of an HTML document where every HTML tag, attribute, and text snippet is an object node (\`Node\` $\to$ \`Element\` $\to$ \`HTMLElement\`).

---

### 2. DOM Selection and Manipulation
\`\`\`javascript
// Performant Selector API
const submitBtn = document.querySelector("#submit-btn");
const listItems = document.querySelectorAll(".quiz-option"); // Returns NodeList

// Efficient Element Creation & Batching with DocumentFragment
const fragment = document.createDocumentFragment();
const users = ["Aditya", "Pooja", "Rahul"];

users.forEach(username => {
  const li = document.createElement("li");
  li.className = "student-item";
  li.textContent = username; // XSS-safe; never use innerHTML with untrusted strings
  fragment.appendChild(li);
});
document.getElementById("student-list").appendChild(fragment); // Single reflow/repaint
\`\`\`

---

### 3. Event Bubbling, Capturing & Delegation
When an event occurs, it travels through three phases:
1. **Capturing Phase:** Propagates from \`window\` down through ancestors to target.
2. **Target Phase:** Fires on the triggered node.
3. **Bubbling Phase:** Bubbles upward from target back to \`window\`.

\`\`\`javascript
// Event Delegation Pattern: Single listener on parent handles all child elements
document.getElementById("questions-container").addEventListener("click", (event) => {
  const option = event.target.closest(".option-card");
  if (!option) return;
  
  event.stopPropagation(); // Halts bubbling up the DOM tree
  console.log("Selected Option Index:", option.dataset.index);
});
\`\`\`

- **\`event.preventDefault()\`:** Suppresses native browser action (e.g., stops \`<form>\` submission reload).
- **\`event.stopPropagation()\`:** Stops the event from propagating further up the bubbling/capturing chain.`,
  "async-javascript-fetch-api": String.raw`### 1. Asynchronous JavaScript & The Event Loop
JavaScript is single-threaded and executes non-blocking I/O using the **Call Stack**, **Web APIs**, **Task Queue (Macrotasks)**, and **Microtask Queue**:
- **Execution Order:** Call Stack $\to$ drain all Microtasks (\`Promise.then\`, \`queueMicrotask\`, \`MutationObserver\`) $\to$ 1 Macrotask (\`setTimeout\`, \`setInterval\`, I/O).

---

### 2. Promises & States
A Promise represents an asynchronous operation with three states:
- \`pending\`: Initial state.
- \`fulfilled\`: Resolved successfully (\`.then(result)\`).
- \`rejected\`: Failed with error (\`.catch(error)\`).

\`\`\`javascript
function fetchStudentData(studentId) {
  return new Promise((resolve, reject) => {
    if (!studentId) reject(new Error("Student PRN is required."));
    setTimeout(() => resolve({ prn: studentId, gpa: 9.4 }), 500);
  });
}
\`\`\`

---

### 3. Modern \`async\` / \`await\` and the Fetch API
\`async/await\` is syntactic sugar over native Promises, providing readable synchronous-like exception handling via \`try...catch\`:

\`\`\`javascript
async function submitQuizAttempt(payload) {
  try {
    const response = await fetch("/api/prepmeup/student/quizzes/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(\`HTTP Error: \${response.status} \${response.statusText}\`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network or parsing error encountered:", error.message);
    throw error;
  }
}
\`\`\`

---

### 4. University Exam Question
**Q1 [5 Marks]:** What is the difference between \`Promise.all()\` and \`Promise.allSettled()\`?
- **Model Answer:**
  - \`Promise.all([p1, p2])\`: Fails fast. If any single promise rejects, the entire returned promise immediately rejects with that reason.
  - \`Promise.allSettled([p1, p2])\`: Waits for all input promises to settle (either fulfill or reject) and returns an array of outcome objects: \`{ status: 'fulfilled', value }\` or \`{ status: 'rejected', reason }\`.`,
  "nodejs-rest-apis": String.raw`### 1. Node.js Architecture & Libuv
Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine:
- **Single-Threaded Event Loop:** Handles thousands of concurrent network connections without thread-per-client overhead.
- **Libuv Thread Pool:** Default 4 background threads (\`UV_THREADPOOL_SIZE\`) offload blocking operations like disk file I/O (\`fs\`), DNS lookups, and crypto hashing (\`crypto.pbkdf2\`).

---

### 2. REST Architectural Constraints
Representational State Transfer (REST) adheres to six core architectural principles:
1. **Stateless:** Every HTTP request from client to server must contain all necessary session state and credentials.
2. **Client-Server Separation:** UI concerns are strictly isolated from data storage concerns.
3. **Uniform Interface:** Standardized URIs (\`/api/v1/students/:id\`) and HTTP Verbs:
   - \`GET\`: Idempotent read.
   - \`POST\`: Create resource.
   - \`PUT\`: Replace entire resource.
   - \`PATCH\`: Partial update.
   - \`DELETE\`: Remove resource.
4. **Cacheable:** Explicit caching headers (\`Cache-Control: public, max-age=3600\`).
5. **Layered System:** Intermediate proxies, CDNs, or load balancers function transparently.

---

### 3. Production Express / Node REST Endpoint Example
\`\`\`javascript
import express from "express";
const app = express();
app.use(express.json());

const students = new Map();

// GET /api/v1/students/:id
app.get("/api/v1/students/:id", (req, res) => {
  const student = students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.status(200).json({ success: true, data: student });
});

// POST /api/v1/students
app.post("/api/v1/students", (req, res) => {
  const { prn, name } = req.body;
  if (!prn || !name) {
    return res.status(400).json({ error: "PRN and name are required." });
  }
  students.set(prn, { prn, name, createdAt: new Date() });
  res.status(201).json({ message: "Student record registered successfully" });
});
\`\`\``,
  "git-github-workflows": String.raw`### 1. Git Internal Object Model
Git is a content-addressable storage system tracking file snapshots using cryptographic SHA-1 / SHA-256 hashes across four fundamental object types:
1. **Blob:** Stores raw file data without filenames or directory structure.
2. **Tree:** Represents directory listings mapping filenames and file modes to blob hashes.
3. **Commit:** Contains a pointer to the root tree, parent commit hash(es), author, committer, and commit message.
4. **Annotated Tag:** Named reference pointing to a specific commit.

---

### 2. The Three Trees Architecture
\`\`\`
[ Working Directory ]  <--- git checkout / restore ---
         |
    git add
         v
  [ Staging Index ]
         |
    git commit
         v
[ Repository (.git) ]  ---> git push ---> [ Remote (GitHub) ]
\`\`\`

---

### 3. Essential Branching & Collaboration Workflows
- **\`git branch <name>\` & \`git switch <name>\`:** Branches in Git are lightweight $41\text{ byte}$ pointers to specific commits.
- **Merge vs Rebase:**
  - \`git merge feature\`: Creates a 3-way merge commit preserving exact history and branch topologies.
  - \`git rebase main\`: Replays feature commits linearly on top of \`main\` branch tip, producing a clean, flat commit history without merge bubbles.
- **Conflict Resolution:** Occurs when two branches modify the same line in a file. Git injects conflict markers (\`<<<<<<< HEAD\`, \`=======\`, \`>>>>>>>\`):
\`\`\`bash
git checkout -b feature/auth-fix
git add app/auth.ts
git commit -m "fix(auth): handle expired jwt token"
git fetch origin
git rebase origin/main
git push origin feature/auth-fix --force-with-lease
\`\`\``,
  "web-deployment-cloudflare": String.raw`### 1. Modern Web Application Deployment Architecture
Modern production web architectures separate edge caching, reverse proxying, and containerized backend compute:

\`\`\`
[ Client Browser ]
        | HTTPS (Port 443)
        v
[ Cloudflare Anycast CDN & WAF ] (DDoS Protection, Edge SSL)
        | Encrypted WireGuard / QUIC Tunnel
        v
[ Cloudflare Daemon (cloudflared) ] (Running on Origin VM)
        | Local Reverse Proxy
        v
[ Nginx Edge Proxy ]
        | Upstream Unix Socket / Port 3000
        v
[ Docker Container (Node.js Next.js Standalone) ]
\`\`\`

---

### 2. Cloudflare Zero-Trust Tunnels (\`cloudflared\`)
- **No Open Inbound Ports:** Traditional servers require public IP exposure and firewall port openings (\`80\`, \`443\`), leaving ports vulnerable to port scans and direct-to-IP DDoS.
- **Outbound Tunneling:** \`cloudflared\` establishes 4 outbound connections over QUIC/UDP to the nearest Cloudflare Anycast edge servers. Inbound web traffic travels back over this pre-established tunnel.

---

### 3. Nginx Reverse Proxy Configuration
\`\`\`nginx
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name prepmeupai.in www.prepmeupai.in;

    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\``,
  "variables-and-operators": String.raw`### 1. Python Dynamic Typing & Memory Model
In Python, variables are not typed storage containers; they are dynamic reference pointers to objects stored in the heap:
\`\`\`python
x = 42        # x references an int object containing 42
y = x         # y points to the exact same object in memory
print(id(x) == id(y))  # True

# Object Interning: Small integers (-5 to 256) are pre-allocated singletons
a = 256
b = 256
print(a is b) # True (identity comparison checks memory address)
\`\`\`

---

### 2. Arithmetic, Bitwise & Logical Operators
- **Integer Division vs True Division:**
  - \`7 / 2 = 3.5\` (True division returns float)
  - \`7 // 2 = 3\` (Floor division rounds towards negative infinity: \`-7 // 2 = -4\`)
- **Operator Precedence:**
  $$\text{Parentheses ()} > \text{Exponentiation (**)} > \text{Bitwise NOT (~)} > \text{Unary (+, -)} > \text{Multiplication (*, /, //, \%)} > \text{Addition (+, -)} > \text{Bitwise Shifts} > \text{Comparisons} > \text{Logical (not, and, or)}$$

---

### 3. Bitwise Manipulation Table
Let $a = 60$ (\`0011 1100\` in binary) and $b = 13$ (\`0000 1101\` in binary):

| Operator | Syntax | Operation | Result (Binary) | Result (Dec) |
| :--- | :--- | :--- | :--- | :--- |
| **AND** | \`a & b\` | Bits set in both | \`0000 1100\` | 12 |
| **OR** | \`a \| b\` | Bits set in either | \`0011 1101\` | 61 |
| **XOR** | \`a ^ b\` | Bits differing | \`0011 0001\` | 49 |
| **NOT** | \`~a\` | Two's complement negation ($-(a+1)$) | \`...1100 0011\`| -61 |
| **Left Shift** | \`a << 2\`| Multiply by $2^2 = 4$ | \`1111 0000\` | 240 |
| **Right Shift**| \`a >> 2\`| Floor divide by $2^2 = 4$ | \`0000 1111\` | 15 |`,
  "python-io-type-casting": String.raw`### 1. Standard Input & Formatted Output
All data read via \`input()\` is captured strictly as an immutable \`str\` primitive. Uncasted inputs cause unexpected concatenation bugs:
\`\`\`python
# Uncasted Input Trap
val = input("Enter marks: ")  # "45"
# total = val + 10  # Raises TypeError: can only concatenate str to str

# Robust Input & Type Casting
score = float(input("Enter marks: "))
\`\`\`

---

### 2. Modern Output Formatting (PEP 498 F-Strings)
\`\`\`python
name = "Rohan"
gpa = 9.87654
rank = 3

# High Precision F-String Specifiers
print(f"Student: {name:>10} | GPA: {gpa:.2f} | Rank: #{rank:03d}")
# Output: Student:      Rohan | GPA: 9.88 | Rank: #003

# Inline Expressions & Debug Specifier (Python 3.8+)
x = 15
print(f"{x * 2 = }")  # Output: x * 2 = 30
\`\`\`

---

### 3. Explicit Type Conversion (Type Casting)
- **\`int(x, base=10)\`:** Converts strings or floats to integer. Truncates towards zero.
  - \`int("1010", 2) = 10\` (Binary parsing)
  - \`int("0xFF", 16) = 255\` (Hexadecimal parsing)
- **\`bool(x)\` (Truth Value Testing):**
  - Falsy values: \`0\`, \`0.0\`, \`""\`, \`[]\`, \`()\`, \`{}\`, \`set()\`, \`None\`, \`False\`.
  - All non-zero and non-empty structures evaluate to \`True\`.`,
  "lambda-map-filter-reduce": String.raw`### 1. Lambda Functions (Anonymous Functions)
A lambda expression creates an anonymous function restricted to a single evaluated expression without statements or assignments:
$$\lambda \; x_1, x_2, \dots, x_n : \text{expression}$$

\`\`\`python
# Syntax: lambda parameters: return_expression
square = lambda x: x ** 2
print(square(5))  # 25

# Practical Sorting Key
students = [("Aarav", 88), ("Diya", 95), ("Karan", 72)]
students.sort(key=lambda s: s[1], reverse=True)
# Result: [('Diya', 95), ('Aarav', 88), ('Karan', 72)]
\`\`\`

---

### 2. Higher-Order Functional Primitives
1. **\`map(function, iterable)\`:** Applies transformation lazily to every element:
   \`\`\`python
   nums = [1, 2, 3, 4]
   squares = list(map(lambda x: x ** 2, nums))  # [1, 4, 9, 16]
   \`\`\`
2. **\`filter(predicate, iterable)\`:** Yields elements for which predicate returns \`True\`:
   \`\`\`python
   evens = list(filter(lambda x: x % 2 == 0, nums))  # [2, 4]
   \`\`\`
3. **\`functools.reduce(function, iterable[, initializer])\`:** Successively combines items into a single accumulated scalar:
   \`\`\`python
   from functools import reduce
   factorial_5 = reduce(lambda acc, curr: acc * curr, range(1, 6))  # 120
   \`\`\`

---

### 3. List Comprehension Equivalence
In modern idiomatic Python, list comprehensions are preferred over \`map\` and \`filter\` for readability:
\`\`\`python
# map & filter equivalent:
squares_of_evens = [x ** 2 for x in nums if x % 2 == 0]
\`\`\``,
  "python-regular-expressions": String.raw`### 1. The \`re\` Engine & Metacharacters
Regular expressions provide declarative pattern-matching over string sequences:

| Metacharacter | Description | Example |
| :--- | :--- | :--- |
| \`^\` / \`$\` | Anchor start / end of string | \`^CSE\` matches strings beginning with "CSE" |
| \`.\` | Any character except newline \`\n\` | \`a.b\` matches "axb", "a9b" |
| \`*\` / \`+\` / \`?\` | Quantifiers: 0+, 1+, 0 or 1 | \`\d+\` matches one or more consecutive digits |
| \`\d\` / \`\D\` | Digit \`[0-9]\` / Non-digit | \`\d{3}\` matches exactly 3 digits |
| \`\w\` / \`\W\` | Word char \`[a-zA-Z0-9_]\` / Non-word | \`\w+\` matches variable identifier tokens |
| \`\s\` / \`\S\` | Whitespace \`[ \t\n\r]\` / Non-whitespace | \`\s*\` matches optional padding |

---

### 2. Common Functions in Python's \`re\` Module
\`\`\`python
import re

text = "Student PRN: 2026CSE104 - Contact: student.prep@dypiu.ac.in, alternative: test@gmail.com"

# 1. re.search: Scans string for first match
match = re.search(r"PRN:\s*(\w+)", text)
if match:
    print("Found PRN:", match.group(1))  # 2026CSE104

# 2. re.findall: Returns list of all matching string patterns
email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
emails = re.findall(email_pattern, text)
print("Emails Extracted:", emails)
# ['student.prep@dypiu.ac.in', 'test@gmail.com']

# 3. re.sub: Search and replace
sanitized = re.sub(r"\d+", "XXX", text)
\`\`\`

---

### 3. Precompiled RegEx Performance
When matching repeatedly inside a loop, compile the regex object once with \`re.compile()\` to avoid redundant parsing overhead:
\`\`\`python
pattern = re.compile(r"^[A-Z]{3}\d{4}$")
is_valid = bool(pattern.match("CSE1005"))  # Fast C-level execution
\`\`\``,
  "classes-objects-constructors": String.raw`### 1. Object-Oriented Principles in Python
Python implements pure Object-Oriented Programming where all classes derive from the base \`object\` type:
- **Class:** A user-defined blueprint defining attributes (state) and methods (behavior).
- **Object (Instance):** An allocated memory instance instantiated from the class.

---

### 2. Constructors (\`__init__\`) and \`self\`
The \`__init__\` dunder method is an initializer called automatically after object memory is allocated by \`__new__\`:
\`\`\`python
class Student:
    # Class Variable (shared across all instances)
    university_name = "D. Y. Patil International University"
    
    def __init__(self, prn: str, name: str, gpa: float):
        # Instance Variables (unique to each instance)
        self.prn = prn
        self.name = name
        self.gpa = gpa
        
    def display_details(self) -> str:
        return f"[{self.prn}] {self.name} - CGPA: {self.gpa:.2f}"

# Object Instantiation
s1 = Student("2026CSE001", "Tanvi", 9.42)
print(s1.display_details())
print(s1.university_name)
\`\`\`

---

### 3. Instance Methods vs Class Methods vs Static Methods
\`\`\`python
class Course:
    def __init__(self, code, credits):
        self.code = code
        self.credits = credits

    # Standard Instance Method: Receives instance pointer 'self'
    def get_hours(self):
        return self.credits * 15

    # Class Method: Receives class reference 'cls'; factory constructor pattern
    @classmethod
    def from_string(cls, course_str):
        code, credits = course_str.split("-")
        return cls(code, int(credits))

    # Static Method: Independent utility function; receives neither self nor cls
    @staticmethod
    def is_valid_code(code):
        return len(code) == 7 and code.isalnum()
\`\`\``,
  "inheritance-polymorphism-mro": String.raw`### 1. Inheritance Hierarchies in Python
Inheritance allows child classes to derive fields and methods from parent classes, promoting code reusability and polymorphism:

\`\`\`python
class Person:
    def __init__(self, name: str, aadhaar: str):
        self.name = name
        self.aadhaar = aadhaar

    def get_role(self) -> str:
        return "General Person"

class Student(Person):
    def __init__(self, name: str, aadhaar: str, prn: str):
        # Explicitly invoke parent constructor
        super().__init__(name, aadhaar)
        self.prn = prn

    # Method Overriding (Polymorphism)
    def get_role(self) -> str:
        return f"Undergraduate Student ({self.prn})"
\`\`\`

---

### 2. Method Resolution Order (MRO) & C3 Linearization
Python supports **Multiple Inheritance**. When methods have identical names across multiple base classes, Python determines lookup order using the **C3 Linearization Algorithm**:
\`\`\`python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print(D.__mro__)
# Output: (<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>)
\`\`\`

- **Diamond Problem Resolution:** Unlike C++ which requires virtual base classes to prevent duplicate parent sub-objects, Python's C3 algorithm guarantees monotonic linear traversal where ancestors are inspected only after their subclasses.

---

### 3. Duck Typing & Polymorphism
"If it walks like a duck and quacks like a duck, it is a duck." Python does not require explicit interfaces:
\`\`\`python
def execute_simulation(engine):
    # Any object implementing run() can be passed polymorphic ally
    engine.run()
\`\`\``,
  "file-handling-exceptions": String.raw`### 1. Robust File I/O & Context Managers
File operations require guaranteed deterministic resource cleanup to prevent operating system file descriptor leaks:

\`\`\`python
# The 'with' statement implements the Context Manager protocol (__enter__ and __exit__)
with open("dataset.csv", mode="r", encoding="utf-8") as f:
    for line in f:  # Memory-efficient iterator; buffers line-by-line
        tokens = line.strip().split(",")
        print(tokens)
# File automatically and safely closed even if exceptions occur inside block!
\`\`\`

- **File Modes:**
  - \`'r'\`: Read-only (default). Raises \`FileNotFoundError\` if missing.
  - \`'w'\`: Truncates and overwrites file or creates new file.
  - \`'a'\`: Appends to end of file without truncation.
  - \`'r+'\`: Read and write simultaneously.
  - \`'b'\`: Binary mode (e.g., \`'rb'\`, \`'wb'\`) for images/compiled files.

---

### 2. Exception Handling (\`try...except...else...finally\`)
\`\`\`python
def read_configuration(file_path: str):
    try:
        f = open(file_path, "r")
        val = int(f.readline().strip())
        result = 100 / val
    except FileNotFoundError as e:
        print(f"[Error] Configuration file missing: {e}")
    except (ValueError, ZeroDivisionError) as e:
        print(f"[Error] Corrupted numeric config: {e}")
    else:
        # Executes ONLY if NO exception was raised in try block
        print(f"Configuration loaded successfully: {result}")
        return result
    finally:
        # ALWAYS executes regardless of exceptions (cleanup phase)
        try:
            f.close()
        except UnboundLocalError:
            pass
\`\`\`

---

### 3. Custom Exception Classes
\`\`\`python
class InvalidScoreError(ValueError):
    '''Raised when marks are out of the valid range [0, 100].'''
    pass

def validate_score(score: float):
    if not (0 <= score <= 100):
        raise InvalidScoreError(f"Score {score} is outside [0, 100]")
\`\`\``,
  "matplotlib-data-visualization": String.raw`### 1. Matplotlib Architecture & The Object-Oriented API
Matplotlib visualization consists of three architectural layers:
1. **Backend Layer:** Renders graphics to raster or vector surfaces (Agg, Cairo, PDF).
2. **Artist Layer:** Everything visible on the canvas is an Artist (\`Figure\`, \`Axes\`, \`Line2D\`, \`Text\`).
3. **Scripting Layer (\`pyplot\`):** State-machine interface. For maintainable production scripts, the **Object-Oriented API** (\`fig, ax = plt.subplots()\`) is preferred over the stateful \`plt.plot()\` procedural interface.

---

### 2. Engineering Plot Example
\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

# Synthetic Telemetry Data
time = np.linspace(0, 10, 500)
voltage = 5.0 * np.sin(2 * np.pi * 1.5 * time) * np.exp(-0.25 * time)

# Object-Oriented Figure and Axes Setup
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=120)

# Plotting with Styling
ax.plot(time, voltage, label=r"$V(t) = 5 e^{-0.25t} \sin(3\pi t)$", color="#ff3b1d", linewidth=2)
ax.axhline(0, color="#666", linestyle="--", linewidth=0.8)

# Engineering Annotations
ax.set_title("Damped Oscillatory Voltage Response", fontsize=14, fontweight="bold", pad=12)
ax.set_xlabel("Time (seconds)", fontsize=11)
ax.set_ylabel("Voltage (Volts)", fontsize=11)
ax.grid(True, linestyle=":", alpha=0.6)
ax.legend(loc="upper right", frameon=True)

# Exporting High-Resolution Vector Asset
fig.tight_layout()
fig.savefig("voltage_response.svg", format="svg", bbox_inches="tight")
plt.close(fig)
\`\`\`

---

### 3. Subplots & Histograms
\`\`\`python
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
scores = [65, 78, 82, 90, 92, 54, 88, 76, 95, 89]

# Subplot 1: Distribution Histogram
axes[0].hist(scores, bins=5, color="#1e88e5", edgecolor="black")
axes[0].set_title("Exam Mark Distribution")

# Subplot 2: Boxplot for Outliers
axes[1].boxplot(scores, vert=False)
axes[1].set_title("Cohort Dispersion Boxplot")
\`\`\``,
  "oral-transmission-vedic-chanting": String.raw`### 1. Vedic Oral Preservation Methodology
For over three millennia prior to written codification, the Vedic texts (over 10,000 verses in the Rigveda alone) were preserved with bit-perfect fidelity without a single variant reading through elaborate mnemonic recitation systems known as the **Ashtavikritis** (Eight Modified Forms of Recitation).

---

### 2. The Recitation Hierarchy (Pathas)
1. **Samhita Patha:** Natural continuous chanting combining words according to Sandhi phonetic rules:
   $$\text{Word}_1 + \text{Word}_2 + \text{Word}_3 + \dots$$
2. **Pada Patha:** Analytic division isolating every individual root word and morpheme without Sandhi modifications ($w_1, w_2, w_3, \dots$).
3. **Krama Patha (Step-by-step paired recitation):**
   $$w_1 w_2, \; w_2 w_3, \; w_3 w_4, \dots$$

---

### 3. The Eight Complex Permutations (Ashtavikriti)
To detect and correct phonetic corruptions, ancient scholars devised eight complex algorithmic permutation schemes:
1. **Jata Patha:** Words recited forwards and backwards in overlapping pairs:
   $$w_1 w_2 w_2 w_1 w_1 w_2, \quad w_2 w_3 w_3 w_2 w_2 w_3, \dots$$
2. **Ghana Patha (Dense / Cubic Chanting):**
   $$w_1 w_2 w_2 w_1 w_1 w_2 w_3 w_3 w_2 w_1 w_1 w_2 w_3$$
   *(Mathematical transposition checking preserving word boundaries, accents, and tones).*

---

### 4. Mathematical & Algorithmic Significance
- **Anticipation of Parity Bits & Checksums:** The Ghana and Jata permutations function as cryptographic cyclic redundancy checks (CRC). If a chanter altered a single vowel length (*Hrasva* vs *Dirgha*) or pitch accent (*Udatta, Anudatta, Svarita*), the mathematical matrix in reverse playback broke immediately.`,
  "classical-architecture-vastu": String.raw`### 1. Foundations of Vastu Vidya & Sthapatya Veda
*Vastu Shastra* is the traditional Indian science of architecture, town planning, and spatial geometry codified in treatises such as the *Manasara*, *Mayamata*, and the *Brihat Samhita* (Varahamihira).

---

### 2. The Vastu Purusha Mandala
The core geometric foundation of classical Indian architecture is the **Vastu Purusha Mandala**, a sacred square grid synthesizing cosmic orientation, cardinal alignments, and structural load balancing:
- **Mandala Grids:**
  - *Peetha:* $3 \times 3 = 9$ square modules.
  - *Manduka / Chandita:* $8 \times 8 = 64$ squares (preferred for residential temples and hermitage layouts).
  - *Paramasayika:* $9 \times 9 = 81$ squares (standard grid for royal palaces, city layouts, and major temple complexes).
- **Zonal Allocations:**
  - **Brahmasthana:** The central unbuilt zone ($3 \times 3$ grid in the 81-square layout), kept open to the sky as a courtyard (*Angana*) for passive solar ventilation and cross-draft thermal comfort.
  - **Cardinal Orientations:**
    - North-East (*Ishanya*): Water bodies, meditation sanctum.
    - South-East (*Agneya*): Fire zone, kitchen, hearth.
    - South-West (*Nairritya*): Earth element, heavy storage, master quarters.
    - North-West (*Vayavya*): Wind element, guest quarters, granary.

---

### 3. Structural Engineering of Indian Temples
- **Trabeate Construction:** Indian temple architecture (Nagara, Dravida, and Vesara styles) relies entirely on post-and-lintel (trabeate) interlocking stonework with zero cementing mortar:
  - *Adhishthana (Plinth):* Heavy granite stone base distributing massive compressive loads.
  - *Garbhagriha (Sanctum Sanctorum):* Perfect cubic sanctuary shielded from external thermal fluctuations.
  - *Shikhara / Vimana:* Hyperbolic or pyramidal towers built using corbelled stone cantilevering.`,
  "krishi-shastra-water-harvesting": String.raw`### 1. Ancient Agronomy & Krishi Shastra
Agricultural science in classical India was systematically documented in Sanskrit texts including the *Krishi-Parashara* (c. 6th century CE), *Vrikshayurveda* (Arboriculture by Surapala), and Kautilya's *Arthashastra*:
- **Soil Classification:** Land categorized based on fertility, texture, and moisture retention:
  - *Urvara* (Fertile loam), *Ushara* (Saline/Arid), *Maru* (Desert sands), *Pankila* (Marshy wetland).
- **Seed Treatment (Vrikshayurveda):** Pre-sowing priming using organic slurries (cow dung, milk, honey, sesame oils, and *Kunapajala* - fermented organic liquid bio-fertilizer rich in nitrogen and peptides).

---

### 2. Traditional Hydraulic Engineering Systems
Ancient India developed regionally customized water harvesting structures suited to varying micro-climates:
1. **Stepwells (*Baolis / Vavs*):**
   - Monumental subterranean architecture (e.g., Rani ki Vav, Gujarat; Chand Baori, Rajasthan).
   - Designed with descending multi-tiered stone pavilions reaching deep groundwater aquifers, keeping stored water cool through subterranean shading and minimizing evaporative loss.
2. **The Tank Cascade System (*Eris* of Tamil Nadu):**
   - Interconnected earthen embankments constructed along natural river sub-basins.
   - When the top tank reached capacity, overflow flowed automatically to the next tank downstream via sluice gates (*madagu*), recharging groundwater without soil erosion.
3. **Inundation Channels (*Ahar-Pyne* of South Bihar):**
   - Flood diversion canals (*pynes*) redirecting seasonal monsoon runoffs into rectangular agricultural catchment basins (*ahars*).
4. **Grand Anicut (Kallanai Dam):**
   - Built by King Karikala Chola (2nd century CE) across the Cauvery River.
   - One of the world's oldest functional water-diversion dams, built with unhewn stone boulders in curved hydraulic alignments to prevent silt deposition.`,
  "arthashastra-and-trade-networks": String.raw`### 1. Kautilya's Arthashastra & Political Economy
Composed by Chanakya (Kautilya) in the 4th century BCE during the Mauryan Empire, the *Arthashastra* is a comprehensive treatise on statecraft, public administration, taxation, and economic governance:
$$\text{"Sukhasya mulam dharmah, dharmasya mulam arthah, arthasya mulam rajyam..."}$$
*(Wealth is the root of welfare; state stability is the root of wealth).*

- **The Saptanga Theory of the State (7 Elements):**
  1. *Swami* (The Sovereign Leader)
  2. *Amatya* (Ministers and Bureaucracy)
  3. *Janapada / Rashtra* (Territory and Population)
  4. *Durga* (Fortified Cities / Infrastructure)
  5. *Kosha* (Treasury and Capital Reserves)
  6. *Danda / Bala* (Armed Forces and Security)
  7. *Mitra* (Allies and Foreign Relations)

---

### 2. Economic Systems & Public Finance
- **Taxation Principles (*Koshavriddhi*):**
  - Fair and non-confiscatory taxation: compared to "plucking ripe fruit from trees without hurting the branches."
  - Standard agricultural tax: $\frac{1}{6}\text{th}$ of produce (*Shadbhaga*).
  - Port duties (*Shulka*) and toll systems on inter-state commercial highways.
- **State Monopolies:** Strategic national assets—mines, metallurgy, salt production, and forestry—were state-regulated under designated superintendents (*Adhyakshas*).

---

### 3. Historic Indian Trade Networks
Classical India served as the epicenter of Afro-Eurasian trade:
- **Uttarapratha (Northern Highway):** Grand commercial route running from Bengal (Tamralipti) through Pataliputra, Mathura, Taxila, and onwards to Central Asia and the Silk Road. Precursor to the Grand Trunk Road.
- **Dakshinapatha (Southern Highway):** Linking Varanasi and Vidisha to the Deccan ports (Bharuch/Barygaza, Sopara) and southern kingdoms.
- **Maritime Indian Ocean Trade:**
  - Export of textiles (muslin, calico), spices (black pepper/Malabar gold), gemstones, and Wootz steel to the Roman Empire, Southeast Asia (Suvarnabhumi), and China.
  - Navigation codified in treatises with astrolabes, magnetic compasses (*Matsya Yantra*), and monsoon wind sailing schedules.`,
};
