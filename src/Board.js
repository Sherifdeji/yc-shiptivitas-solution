import React from "react";
import Dragula from "dragula";
import "dragula/dist/dragula.css";
import Swimlane from "./Swimlane";
import "./Board.css";

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
  }

  componentDidMount() {
    this.drake = Dragula(
      [
        this.swimlanes.backlog.current,
        this.swimlanes.inProgress.current,
        this.swimlanes.complete.current,
      ],
      { revertOnSpill: true }
    );

    this.drake.on("drop", (el, target, source, sibling) => {
      this.drake.cancel(true); // Prevent default DOM change

      // Parse cardId to an integer to match the data type in the state
      const cardId = parseInt(el.getAttribute("data-id"), 10);

      let newStatus;
      if (target === this.swimlanes.inProgress.current) {
        newStatus = "in-progress";
      } else if (target === this.swimlanes.complete.current) {
        newStatus = "complete";
      } else {
        newStatus = "backlog";
      }

      // --- Corrected Priority Calculation for Integer-based Backend ---
      const targetLaneKey = this.getStateKeyFromElement(target);
      const targetCards = this.props.clients[targetLaneKey] || [];
      let newPriority;

      if (sibling) {
        // Dropped before a sibling. The new priority will be the sibling's priority.
        // The backend will handle shifting other cards to make space.
        const siblingId = parseInt(sibling.getAttribute("data-id"), 10);
        const siblingCard = targetCards.find((c) => c.id === siblingId);

        if (siblingCard) {
          newPriority = siblingCard.priority;
        } else {
          // This is a fallback in case the sibling isn't found, place at end.
          const lastCard = targetCards[targetCards.length - 1];
          newPriority = lastCard ? lastCard.priority + 1 : 1;
        }
      } else {
        // Dropped at the end of the list. New priority is one more than the last card's.
        const lastCard = targetCards[targetCards.length - 1];
        newPriority = lastCard ? lastCard.priority + 1 : 1;
      }
      // --- End of Fix ---

      // Call the parent function to handle the API update
      this.props.onCardMove(cardId, newStatus, newPriority);
    });
  }

  componentWillUnmount() {
    this.drake.destroy();
  }

  getStateKeyFromElement(element) {
    if (element === this.swimlanes.backlog.current) return "backlog";
    if (element === this.swimlanes.inProgress.current) return "inProgress";
    if (element === this.swimlanes.complete.current) return "complete";
    return null;
  }

  renderSwimlane(name, clients, ref) {
    return <Swimlane name={name} clients={clients || []} dragulaRef={ref} />;
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane(
                "Backlog",
                this.props.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "In Progress",
                this.props.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "Complete",
                this.props.clients.complete,
                this.swimlanes.complete
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
