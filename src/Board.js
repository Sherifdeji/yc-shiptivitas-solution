import React from "react";
import Dragula from "dragula";
import "dragula/dist/dragula.css";
import Swimlane from "./Swimlane";
import "./Board.css";

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    this.state = {
      clients: {
        backlog: clients,
        inProgress: [],
        complete: [],
      },
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
  }

  getClients() {
    return [
      ["1", "Stark, White and Abbott", "Cloned Optimal Architecture"],
      ["2", "Wiza LLC", "Exclusive Bandwidth-Monitored Implementation"],
      [
        "3",
        "Nolan LLC",
        "Vision-Oriented 4Thgeneration Graphicaluserinterface",
      ],
      ["4", "Thompson PLC", "Streamlined Regional Knowledgeuser"],
      ["5", "Walker-Williamson", "Team-Oriented 6Thgeneration Matrix"],
      ["6", "Boehm and Sons", "Automated Systematic Paradigm"],
      [
        "7",
        "Runolfsson, Hegmann and Block",
        "Integrated Transitional Strategy",
      ],
      ["8", "Schumm-Labadie", "Operative Heuristic Challenge"],
      ["9", "Kohler Group", "Re-Contextualized Multi-Tasking Attitude"],
      ["10", "Romaguera Inc", "Managed Foreground Toolset"],
      ["11", "Reilly-King", "Future-Proofed Interactive Toolset"],
      [
        "12",
        "Emard, Champlin and Runolfsdottir",
        "Devolved Needs-Based Capability",
      ],
      ["13", "Fritsch, Cronin and Wolff", "Open-Source 3Rdgeneration Website"],
      ["14", "Borer LLC", "Profit-Focused Incremental Orchestration"],
      ["15", "Emmerich-Ankunding", "User-Centric Stable Extranet"],
      ["16", "Willms-Abbott", "Progressive Bandwidth-Monitored Access"],
      ["17", "Brekke PLC", "Intuitive User-Facing Customerloyalty"],
      ["18", "Bins, Toy and Klocko", "Integrated Assymetric Software"],
      ["19", "Hodkiewicz-Hayes", "Programmable Systematic Securedline"],
      ["20", "Murphy, Lang and Ferry", "Organized Explicit Access"],
    ].map((companyDetails) => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: "backlog",
    }));
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
      this.drake.cancel(true); // IMPORTANT: Prevent Dragula's default DOM change

      const cardId = el.getAttribute("data-id");
      const targetLaneKey = this.getStateKeyFromElement(target);
      const sourceLaneKey = this.getStateKeyFromElement(source);

      this.setState((prevState) => {
        const state = JSON.parse(JSON.stringify(prevState)); // Deep copy state to avoid mutation
        const { clients } = state;

        const card = clients[sourceLaneKey].find((c) => c.id === cardId);
        if (!card) return;

        // Remove card from the source lane
        const sourceCards = clients[sourceLaneKey].filter(
          (c) => c.id !== cardId
        );
        clients[sourceLaneKey] = sourceCards;

        // Find the new index for the card
        let newIndex = 0;
        if (sibling) {
          const siblingCard = clients[targetLaneKey].find(
            (c) => c.id === sibling.getAttribute("data-id")
          );
          newIndex = clients[targetLaneKey].indexOf(siblingCard);
        } else {
          // If no sibling, it's at the end of the list
          newIndex = clients[targetLaneKey].length;
        }

        // Update card status if it moved to a new lane
        if (sourceLaneKey !== targetLaneKey) {
          card.status =
            targetLaneKey === "inProgress" ? "in-progress" : targetLaneKey;
        }

        // Add the card to its new lane at the correct position
        clients[targetLaneKey].splice(newIndex, 0, card);

        return state;
      });
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
    return <Swimlane name={name} clients={clients} dragulaRef={ref} />;
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane(
                "Backlog",
                this.state.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "In Progress",
                this.state.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "Complete",
                this.state.clients.complete,
                this.swimlanes.complete
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.drake = Dragula([
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ]);
    this.drake.on('drop', (el, target, source, sibling) => this.updateClient(el, target, source, sibling));
  }

  componentWillUnmount() {
    this.drake.remove();
  }

  /**
   * Change the status of client when a Card is moved
   */
  updateClient(el, target, _, sibling) {
    // Reverting DOM changes from Dragula
    this.drake.cancel(true);

    // Find out which swimlane the Card was moved to
    let targetSwimlane = 'backlog';
    if (target === this.swimlanes.inProgress.current) {
      targetSwimlane = 'in-progress';
    } else if (target === this.swimlanes.complete.current) {
      targetSwimlane = 'complete';
    }

    // Create a new clients array
    const clientsList = [
      ...this.state.clients.backlog,
      ...this.state.clients.inProgress,
      ...this.state.clients.complete,
    ];
    const clientThatMoved = clientsList.find(client => client.id === el.dataset.id);
    const clientThatMovedClone = {
      ...clientThatMoved,
      status: targetSwimlane,
    };

    // Remove ClientThatMoved from the clientsList
    const updatedClients = clientsList.filter(client => client.id !== clientThatMovedClone.id);

    // Place ClientThatMoved just before the sibling client, keeping the order
    const index = updatedClients.findIndex(client => sibling && client.id === sibling.dataset.id);
    updatedClients.splice(index === -1 ? updatedClients.length : index , 0, clientThatMovedClone);

    // Update React state to reflect changes
    this.setState({
      clients: {
        backlog: updatedClients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: updatedClients.filter(client => client.status && client.status === 'in-progress'),
        complete: updatedClients.filter(client => client.status && client.status === 'complete'),
      }
    });
  }
}
