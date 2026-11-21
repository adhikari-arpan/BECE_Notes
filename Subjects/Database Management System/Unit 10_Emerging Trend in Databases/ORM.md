# ORM (Object-Relational Mapping)

## What is ORM?

**ORM (Object-Relational Mapping)** is a technique that allows developers to interact with a **relational database using an object-oriented approach**.

It acts as a **bridge between an Object-Oriented Programming (OOP) language and a relational SQL database**.

Instead of directly writing SQL queries, developers work with **objects, classes, and methods**. The ORM framework automatically translates these operations into SQL queries.

### Simple Example

Suppose we have a `Student` class:

```text
Student
----------------
id
name
age
email
```

In an ORM system:

```python
student = Student(name="Arpan", age=21)
database.save(student)
```

The ORM may automatically generate an SQL query similar to:

```sql
INSERT INTO student (name, age)
VALUES ('Arpan', 21);
```

Thus:

**OOP Objects ↔ ORM ↔ Relational Database**

---

# How Does ORM Work?

ORM maps **objects and classes** in a program to **tables and records** in a relational database.

### Basic Mapping

| Object-Oriented Concept | Relational Database Concept |
| ----------------------- | --------------------------- |
| Class                   | Table                       |
| Object                  | Row / Record                |
| Attribute               | Column                      |
| Object ID               | Primary Key                 |
| Object Relationship     | Foreign Key / Relationship  |
| Method                  | Application Logic           |

### Working Process

1. Developer creates **classes and objects** in the programming language.
2. ORM maps the classes to corresponding **database tables**.
3. When an object is created or modified, the ORM converts the operation into **SQL queries**.
4. The database executes the generated SQL.
5. The returned rows and columns are converted back into **objects**.
6. The application works with the objects instead of directly handling database records.

### ORM Working Diagram

```text
Application
     ↓
Objects / Classes
     ↓
     ORM
     ↓
SQL Queries
     ↓
Relational Database
     ↓
SQL Results
     ↓
     ORM
     ↓
Objects
```

---

# Example of ORM

Consider a `Student` class:

```text
Student
- id
- name
- email
- age
```

The ORM can map it to a database table:

```text
STUDENT TABLE

+----+-------+----------------+-----+
| id | name  | email          | age |
+----+-------+----------------+-----+
| 1  | Arpan | arpan@email.com | 21  |
+----+-------+----------------+-----+
```

Instead of writing:

```sql
SELECT * FROM student WHERE id = 1;
```

The developer may use an ORM operation such as:

```text
Student.findById(1)
```

The ORM generates the appropriate SQL query internally and returns the result as a `Student` object.

---

# Popular ORM Frameworks

| ORM Framework    | Programming Language    |
| ---------------- | ----------------------- |
| Hibernate        | Java                    |
| SQLAlchemy       | Python                  |
| Django ORM       | Python                  |
| TypeORM          | TypeScript / Node.js    |
| Entity Framework | C#                      |
| Sequelize        | JavaScript / Node.js    |
| Prisma           | JavaScript / TypeScript |

---

# Advantages of ORM

## 1. Reduces the Need to Write SQL

Developers can work with **objects and methods** instead of manually writing SQL queries for common database operations.

```text
Objects → ORM → SQL
```

This can reduce repetitive database code.

---

## 2. Improves Code Maintainability

ORM keeps much of the database interaction separate from the main business logic.

- Code becomes more organized.
- Database operations are easier to manage.
- Changes can often be handled within the model or ORM configuration.

---

## 3. Reduces SQL Injection Risks

Most ORM frameworks use **parameterized queries** or similar mechanisms when handling values.

This reduces the risk of SQL injection when the ORM is used correctly.

> ORM does not automatically make an application completely secure. Unsafe raw SQL or incorrect ORM usage can still introduce security vulnerabilities.

---

## 4. Increases Developer Productivity

Developers can perform common operations using simple methods instead of writing SQL repeatedly.

Common operations include:

- Insert
- Select
- Update
- Delete

These are commonly known as **CRUD operations**:

- **C** → Create
- **R** → Read
- **U** → Update
- **D** → Delete

---

## 5. Supports Object-Oriented Programming

ORM works naturally with OOP concepts such as:

- Classes
- Objects
- Encapsulation
- Inheritance
- Relationships

This makes database operations easier to integrate with object-oriented applications.

---

## 6. Handles Relationships

ORM frameworks can represent relationships between objects and database tables.

Common relationships include:

- One-to-One
- One-to-Many
- Many-to-One
- Many-to-Many

### Example

```text
Department
    |
    | 1
    |
    | Many
    ↓
Students
```

One department can have many students.

---

## 7. Database Abstraction

ORM provides an abstraction layer between the application and database.

Developers can often switch between supported database systems with fewer application-level changes.

For example:

```text
Application
     ↓
    ORM
     ↓
MySQL / PostgreSQL / SQLite
```

However, complete database independence is **not always guaranteed**, because different databases have different features and SQL behaviors.

---

## 8. Automatic Mapping

ORM automatically maps:

```text
Class       → Table
Object      → Row
Attribute   → Column
```

This reduces the amount of manual conversion required between application objects and database records.

---

# Disadvantages of ORM

## 1. Performance Overhead

ORM adds an additional layer between the application and database.

```text
Application → ORM → Database
```

This can sometimes introduce overhead compared with carefully optimized SQL.

---

## 2. Complex Queries Can Be Difficult

For simple operations, ORM is convenient.

However, complex queries involving:

- Multiple joins
- Aggregation
- Advanced filtering
- Database-specific features

may be easier or more efficient to write directly in SQL.

---

## 3. Learning Curve

Developers need to understand:

- The ORM framework
- Object-relational mapping
- Relationships
- Query generation
- Transactions
- Database behavior

Therefore, learning an ORM can take additional time.

---

## 4. Hidden SQL Queries

ORM automatically generates SQL queries.

This can make it difficult for beginners to understand what is actually happening in the database.

Poorly written ORM code can also generate inefficient queries.

---

## 5. Not Always Suitable for Every Application

ORM is particularly useful for applications with significant object-oriented business logic.

For:

- Very simple databases
- Reporting-heavy applications
- Highly optimized database operations
- Complex database-specific queries

Direct SQL or a combination of ORM and SQL may sometimes be more appropriate.

---

# ORM vs Direct SQL

| Feature              | ORM                     | Direct SQL              |
| -------------------- | ----------------------- | ----------------------- |
| Programming style    | Object-oriented         | SQL-based               |
| SQL writing          | Reduced                 | Required                |
| Development speed    | Usually faster for CRUD | Can require more code   |
| Complex queries      | Can be difficult        | More flexible           |
| Database abstraction | Higher                  | Lower                   |
| Performance control  | Less direct             | More direct             |
| OOP integration      | Excellent               | Requires manual mapping |
| Learning             | ORM + database concepts | SQL + database concepts |

---

# Key Terms in ORM

## 1. Entity

An **entity** is an object or class that represents a database record.

**Example:**

```text
Student
```

---

## 2. Model

A model represents the structure and behavior of data used by the application.

---

## 3. Mapping

Mapping defines how application objects correspond to database structures.

**Example:**

```text
Student class → student table
```

---

## 4. Query

An ORM provides methods or query languages to retrieve and manipulate database data.

---

## 5. Transaction

A transaction is a group of database operations treated as a single unit.

A transaction helps maintain data consistency by ensuring that operations are completed successfully or rolled back when appropriate.

---

# CRUD Operations in ORM

CRUD stands for **Create, Read, Update, and Delete**.

| Operation | Meaning              | Example              |
| --------- | -------------------- | -------------------- |
| Create    | Insert new data      | Add a student        |
| Read      | Retrieve data        | Find a student       |
| Update    | Modify existing data | Change student email |
| Delete    | Remove data          | Delete a student     |

### Example of CRUD

```text
Create  → Add a new student
Read    → View student details
Update  → Change student information
Delete  → Remove a student
```

---

# ORM and Impedance Mismatch

## What is Impedance Mismatch?

**Impedance mismatch** refers to the differences between the object-oriented programming model and the relational database model.

Object-oriented programming uses:

- Classes
- Objects
- Inheritance
- Encapsulation

Relational databases use:

- Tables
- Rows
- Columns
- Foreign keys

These differences make it necessary to convert objects into relational data and vice versa.

### How ORM Helps

ORM reduces impedance mismatch by automatically mapping objects to database tables and records.

```text
Object-Oriented Model
          ↕
          ORM
          ↕
Relational Model
```

---

# Summary

**ORM (Object-Relational Mapping)** is a technique that connects **object-oriented programs with relational databases**.

It maps:

```text
Class        → Table
Object       → Row
Attribute    → Column
Relationship → Foreign Key / Relationship
```

### Main Advantages

- Reduces the need for writing SQL.
- Improves code maintainability.
- Increases developer productivity.
- Supports OOP concepts.
- Handles database relationships.
- Provides database abstraction.
- Can reduce SQL injection risks when used correctly.

### Main Disadvantages

- May introduce performance overhead.
- Complex queries can be difficult.
- Requires learning the ORM framework.
- Generated SQL may be hidden from developers.
- May not be ideal for every type of application.

### In One Line

> **ORM is a bridge that allows an object-oriented application to communicate with a relational database by mapping objects to database tables.**
