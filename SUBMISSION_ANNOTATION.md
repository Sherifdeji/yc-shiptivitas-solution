### **Project Submission: Shiptivitas Kanban Board Feature**

**Contributor:** Sherif Ibrahim
**Date:** September 7, 2025

#### **Objective**

The primary goal of this task was to enhance the Shiptivitas application by transforming the existing task list into a fully interactive Kanban board. The key requirements were to allow users to drag and drop shipping requests between three swimlanes (Backlog, In Progress, Complete), reorder tasks within a lane, and have the UI update reliably and instantly.

#### **Core Technical Challenge**

The central technical challenge was integrating the `dragula` library, which directly manipulates the DOM, with React's declarative, state-driven rendering architecture. Initial implementations led to common conflicts, such as the "Node is not a child" error, UI desynchronization, and item duplication. This occurs because two different systems (Dragula and React) were competing to control the same DOM elements.

My solution was built around a core principle: **React must be the single source of truth.** Dragula is used only as an event listener to inform the application of the user's intent; it is never allowed to permanently alter the DOM itself.

#### **Summary of Contributions and Key Changes**

My work focused primarily on the `Board.js` component, which acts as the controller for the entire Kanban board.

1.  **Initial State Configuration (`constructor` & `getClients`)**

    - Modified the initial state setup to ensure that upon loading, **all shipping requests are correctly placed in the "Backlog" swimlane** by default.
    - Standardized the data structure by assigning a `status: 'backlog'` property to every task object, fulfilling a key acceptance criterion.

2.  **Robust Drag-and-Drop Logic (`componentDidMount`)**

    - **Established React's Control:** The most critical change was implementing `drake.cancel(true)` within the `drop` event listener. This immediately reverts Dragula's own DOM manipulation, preventing any conflict with React's rendering cycle.
    - **Immutable State Management:** To ensure predictable and bug-free UI updates, I implemented an immutable state update pattern. On every drop event, a deep copy of the state is created using `JSON.parse(JSON.stringify(prevState))`. All modifications are made to this copy, and the new object is then passed to `setState`, guaranteeing a clean re-render.
    - **Unified Drop Logic:** I used a single, robust logic block that handles both **reordering cards within the same lane** and **moving cards between different lanes**.
    - **Accurate Position Tracking:** The logic correctly uses the `sibling` element provided by the Dragula event to calculate the precise index where the dropped card should be inserted. This was the key to fixing the reordering bug and ensuring cards land exactly where the user drops them.
    - **Conditional Status Updates:** The card's `status` property is only updated when it moves to a _new_ swimlane. This prevents unnecessary data changes when a user is simply reordering tasks in the same column.

3.  **Component Cleanup and Best Practices**
    - **`Card.js`:** Updated the Card component to display only the essential information (the company name), creating a cleaner and more uniform UI as per the design.
    - **`componentWillUnmount`:** Implemented the cleanup method to call `this.drake.destroy()`, preventing memory leaks by removing Dragula's event listeners when the component is no longer on the screen.

#### **Final Outcome**

The result is a smooth, reliable, and intuitive Kanban board that fully meets all acceptance criteria. The final implementation successfully:

- Displays all tasks in the "Backlog" lane on initial load.
- Allows users to seamlessly reorder cards within any swimlane.
- Allows users to move cards between the "Backlog," "In Progress," and "Complete" swimlanes.
- Maintains perfect synchronization between the user's actions and the application's state, eliminating all previous bugs and errors.
- Updates a card's visual style (color) based on its column, providing clear visual feedback to the user.
