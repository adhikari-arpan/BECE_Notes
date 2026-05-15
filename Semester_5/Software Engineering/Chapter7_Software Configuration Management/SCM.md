# Chapter 7: Software Configuration Management (SCM)

---

## What is Software Configuration Management?

Software Configuration Management (SCM) is the **discipline of tracking and controlling changes** in software. It manages the evolution of software systems throughout their entire lifecycle — from development to maintenance.

> Think of SCM as the **"control system"** of a software project — it ensures the right version of the right files reaches the right people at the right time.

### Why is SCM Important?
- Multiple developers work on the same codebase simultaneously
- Software changes constantly due to bug fixes, new features, and requirements changes
- Without SCM, chaos results — wrong versions get deployed, changes get lost, conflicts arise

---

## 7.1 Software Configuration Items (SCIs)

### What is a Configuration Item?
A **Software Configuration Item (SCI)** is any artifact produced during software development that needs to be **identified, controlled, and tracked**.

Essentially — *anything that can change and affect the software* is a configuration item.

### Types of Configuration Items

**1. Source Code Files**
All program files written by developers. These are the most obvious SCIs.

**2. Data Files**
Test data, configuration data, database schemas — any data the software depends on.

**3. Documents**
- Requirements specifications
- Design documents
- Test plans
- User manuals
- Project plans

**4. Executable Programs**
Compiled binaries and executable files ready for deployment.

**5. Libraries and Components**
Third-party libraries, reusable components, APIs used in the system.

**6. Build Files and Scripts**
Makefiles, build scripts, deployment scripts — anything needed to build the system.

### Baseline
A **baseline** is a formally reviewed and agreed-upon version of a configuration item that serves as the basis for future development.

```
Development → Review → Approved → BASELINE established
                                        ↓
                              Future changes controlled
```

Once a baseline is set, changes can only happen through **formal change control procedures**.

### SCI Identification
Each SCI must have:
- A **unique name** (e.g., `login_module_v2.1`)
- A **version number**
- A **description**
- **Relationship** to other SCIs

---

## 7.2 Configuration Management Activities

SCM involves four major activities:

```
┌─────────────────────────────────────────────┐
│         SCM Activities                      │
│                                             │
│  1. Change Management                       │
│  2. Version Management                      │
│  3. System Building                         │
│  4. System Release                          │
└─────────────────────────────────────────────┘
```

---

## 7.2.1 Change Management

### What is Change Management?
Change management is the **formal process of controlling how changes are proposed, evaluated, approved, and implemented** in software.

Software changes are inevitable — users request new features, bugs are found, regulations change. Without a proper process, uncontrolled changes cause instability.

### Why is Change Management Needed?
- Prevents unauthorized or random modifications
- Ensures every change is evaluated for impact
- Maintains stability of the software system
- Provides an audit trail of what changed and why

### The Change Management Process

```
Change Request Submitted
        ↓
Change Request Analysis
        ↓
Impact Assessment
        ↓
Change Control Board (CCB) Review
        ↓
    Approved?
   ↙        ↘
 YES          NO
  ↓            ↓
Implement    Reject & Notify
  ↓
Verify & Test
  ↓
Close Change Request
```

### Step-by-Step Explanation

**Step 1 — Change Request (CR) Submission**
Anyone (developer, tester, user, client) can submit a change request. The CR includes:
- Description of the change
- Reason for the change
- Urgency/priority

**Step 2 — Change Analysis**
The requested change is analyzed to understand:
- What exactly needs to change?
- Which SCIs are affected?
- How complex is this change?

**Step 3 — Impact Assessment**
Before approval, the team evaluates:
- Cost of implementing the change
- Time required
- Risk involved
- Effect on other parts of the system

**Step 4 — Change Control Board (CCB)**
The CCB is a committee of stakeholders who review and either **approve or reject** the change. Members typically include project managers, senior developers, and client representatives.

**Step 5 — Implementation**
If approved, the change is assigned to a developer, implemented in a controlled manner, and documented.

**Step 6 — Verification**
The change is tested to ensure it works correctly and hasn't broken anything else (regression testing).

**Step 7 — Closure**
The change request is officially closed and documented.

### Types of Changes
| Type | Description | Example |
|---|---|---|
| Corrective | Fix a defect | Bug fix |
| Adaptive | Adapt to new environment | OS upgrade compatibility |
| Perfective | Improve performance/features | Faster search algorithm |
| Preventive | Prevent future problems | Code refactoring |

---

## 7.2.2 Version Management

### What is Version Management?
Version management (also called **Version Control**) is the process of **tracking and managing different versions of software components** over time.

Every time a file changes, a new version is created. Version management ensures that:
- All versions are saved and accessible
- Developers can work simultaneously without conflicts
- Previous versions can be restored if something goes wrong

### Key Concepts

**Version**
A specific state of a configuration item at a point in time.
```
login.java → v1.0 → v1.1 → v1.2 → v2.0
```

**Revision**
A new version created by modifying a previous version (linear progression).

**Variant**
A version created for a different platform or configuration (parallel versions).
```
app_windows_v1.0
app_linux_v1.0    ← These are variants
app_mac_v1.0
```

**Branch**
A separate line of development that diverges from the main codebase.

```
         Main Branch
─────────────────────────────────→
              ↓
         Feature Branch
         ─────────────→ (merged back later)
```

**Merging**
Combining changes from two branches back into one.

### Version Numbering Scheme
```
Major.Minor.Patch
  2  .  1  .  3

Major → Big changes, new features (breaks backward compatibility)
Minor → Small features added (backward compatible)
Patch → Bug fixes only
```

### Version Control Systems (VCS)

**Centralized VCS**
One central server holds all versions. Developers check out files, modify them, and check them back in.
- Example: SVN (Subversion), CVS
- Problem: If server goes down, no one can work

**Distributed VCS**
Every developer has a full copy of the repository. Changes are pushed/pulled between repositories.
- Example: **Git**, Mercurial
- Advantage: Work offline, more flexible

### Version Management Activities

**Check-out**
Taking a copy of a file from the repository to work on locally.

**Check-in / Commit**
Saving your modified file back to the repository with a description of changes.

**Diff**
Comparing two versions to see what changed.

**Rollback**
Reverting to a previous version when the current one has problems.

**Tagging**
Marking a specific version with a label (e.g., `Release_v2.0`).

### Codeline and Mainline

**Codeline** — A sequence of versions of source code, where later versions are derived from earlier ones.

**Mainline** — The principal codeline that represents the most stable, up-to-date version of the system. New features are merged into the mainline after testing.

```
Mainline:   ──v1──v2──v3──v4──v5──→
                  ↑         ↑
            Feature A   Feature B
            branch      branch
            merged      merged
```

---

## 7.2.3 System Building

### What is System Building?
System building is the process of **assembling all software components, compiling source code, linking libraries, and creating an executable system** from source files.

It answers: *"How do we turn source code into a working software system?"*

### The System Building Process

```
Source Code Files
       +
Configuration Files
       +
Libraries & Dependencies
       ↓
   BUILD SYSTEM
       ↓
Compiled Object Files
       ↓
Linked Executables
       ↓
Packaged System (ready to deploy)
```

### Key Components of System Building

**Build Scripts**
Automated instructions that tell the build system what to compile, in what order, and how to link everything.
- Examples: `Makefile`, `build.gradle`, `pom.xml`

**Build Tools**
Software that automates the build process.
- Examples: **Make**, **Maven**, **Gradle**, **Ant**, **CMake**

**Build Server / CI System**
A dedicated server that automatically builds the system whenever code is committed.
- Examples: **Jenkins**, **GitHub Actions**, **Travis CI**

### Steps in System Building

**Step 1 — Dependency Resolution**
Identify all files and libraries needed. Determine the order in which they must be compiled.

**Step 2 — Compilation**
Convert source code files into object files (machine-readable intermediate format).

**Step 3 — Linking**
Combine all object files and libraries into a single executable program.

**Step 4 — Testing**
Automatically run tests to verify the build is correct.

**Step 5 — Packaging**
Bundle the executable with all necessary files for distribution.

### Build System Features

| Feature | Description |
|---|---|
| Minimal recompilation | Only recompile files that have changed |
| Dependency tracking | Automatically detect what depends on what |
| Parallel builds | Compile multiple files simultaneously |
| Cross-platform builds | Build for different operating systems |
| Error reporting | Clearly report what went wrong |

### Continuous Integration (CI)
A modern practice where every code commit **automatically triggers a build and test**. This ensures the system is always in a working state.

```
Developer commits code
        ↓
CI server detects commit
        ↓
Automatic build triggered
        ↓
Automatic tests run
        ↓
Pass? → Notify team ✅
Fail? → Alert developer ❌
```

### Build Agility
Build systems should be:
- **Fast** — Developers shouldn't wait long for results
- **Reliable** — Same inputs always produce same outputs
- **Reproducible** — Any team member can build the system identically

---

## 7.2.4 System Release

### What is System Release?
System release is the process of **preparing, packaging, and distributing a version of the software to end users or deployment environments**.

A release is more than just sending out a program — it's a carefully managed process ensuring users receive a complete, correct, and documented package.

### Types of Releases

**Alpha Release**
- Internal testing release
- Incomplete features, many bugs expected
- Only for internal developers/testers

**Beta Release**
- External testing release
- Most features complete, some bugs expected
- Limited group of real users test it

**Release Candidate (RC)**
- Near-final version
- If no critical bugs found, this becomes the final release

**General Release (GA / Production)**
- Final, stable version available to all users

**Patch/Hotfix Release**
- Emergency fix for critical bugs in production

### Contents of a Release Package
A release is not just an executable — it includes:

```
Release Package
├── Executable / Installer
├── Configuration Files
├── Deployment Scripts
├── Database Migration Scripts
├── User Documentation
├── Release Notes (what changed)
├── License Files
└── README / Installation Guide
```

### The Release Process

```
Feature Complete
      ↓
Code Freeze (no new features)
      ↓
Final Testing & QA
      ↓
Release Candidate Built
      ↓
Acceptance Testing
      ↓
Release Approved
      ↓
Release Package Created
      ↓
Deployment to Production
      ↓
Monitor & Support
```

### Release Notes
Every release must include **release notes** documenting:
- New features added
- Bugs fixed
- Known issues
- Upgrade/migration instructions
- System requirements

### Release Management Considerations

**Versioning**
Each release must have a clear version number so users and support teams know exactly what version is installed.

**Backward Compatibility**
New releases should ideally work with existing data and configurations from previous versions.

**Rollback Plan**
If a release causes problems in production, there must be a plan to **quickly revert to the previous version**.

**Release Scheduling**
Releases should be planned carefully:
- Avoid releasing on Fridays (less support available)
- Consider user time zones
- Communicate release dates in advance

### Release vs. Deployment

| Release | Deployment |
|---|---|
| Creating and packaging the software | Installing and running it in an environment |
| Done by development/release team | Done by operations/DevOps team |
| Happens once per version | Can happen multiple times (dev, test, prod) |

### Modern Release Practices

**Continuous Delivery (CD)**
Every passing build is automatically prepared for release — the decision to release is manual.

**Continuous Deployment**
Every passing build is **automatically released** to production with no manual step.

```
Code → Build → Test → Release → Deploy
  ←─── Continuous Integration ───→
  ←─────── Continuous Delivery ────→
  ←──────── Continuous Deployment ──→
```

---

## Summary Table

| Activity | Purpose | Key Output |
|---|---|---|
| **Configuration Items** | Identify what to manage | SCI list + Baselines |
| **Change Management** | Control how changes happen | Approved Change Requests |
| **Version Management** | Track all versions of items | Version history + Branches |
| **System Building** | Assemble working software | Executable system |
| **System Release** | Deliver software to users | Release package |

---

## Final Exam Line

> **Software Configuration Management (SCM)** ensures that software changes are tracked, versions are controlled, systems are built consistently, and releases are delivered reliably — maintaining the integrity and stability of software throughout its lifecycle.