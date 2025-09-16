import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import HomeTab from "./HomeTab";
import Navigation from "./Navigation";
import Board from "./Board";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: "home",
      clients: {
        backlog: [],
        inProgress: [],
        complete: [],
      },
    };
    this.handleCardMove = this.handleCardMove.bind(this);
  }

  componentDidMount() {
    // Fetch initial data from the server
    fetch("http://localhost:3001/api/v1/clients")
      .then((res) => res.json())
      .then((data) => {
        this.setState({ clients: this.categorizeClients(data) });
      })
      .catch((error) => console.error("Error fetching clients:", error));
  }

  categorizeClients(clients) {
    const categorized = {
      backlog: [],
      inProgress: [],
      complete: [],
    };

    clients.forEach((client) => {
      switch (client.status) {
        case "in-progress":
          categorized.inProgress.push(client);
          break;
        case "complete":
          categorized.complete.push(client);
          break;
        case "backlog":
        default:
          categorized.backlog.push(client);
          break;
      }
    });

    // Sort each lane by priority
    Object.keys(categorized).forEach((key) => {
      categorized[key].sort((a, b) => a.priority - b.priority);
    });

    return categorized;
  }

  handleCardMove(cardId, newStatus, newPriority) {
    fetch(`http://localhost:3001/api/v1/clients/${cardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
        priority: newPriority,
      }),
    })
      .then((res) => res.json())
      .then((updatedClients) => {
        // Sync state with the complete list from the backend
        this.setState({ clients: this.categorizeClients(updatedClients) });
      })
      .catch((error) => console.error("Error updating client:", error));
  }

  renderShippingRequests() {
    return (
      <Board clients={this.state.clients} onCardMove={this.handleCardMove} />
    );
  }

  renderNavigation() {
    return (
      <Navigation
        onClick={(tabName) => this.changeTab(tabName)}
        selectedTab={this.state.selectedTab}
      />
    );
  }

  renderTabContent() {
    switch (this.state.selectedTab) {
      case "home":
      default:
        return HomeTab();
      case "shipping-requests":
        return this.renderShippingRequests();
    }
  }
  render() {
    return (
      <div className="App">
        {this.renderNavigation()}

        <div className="App-body">{this.renderTabContent()}</div>
      </div>
    );
  }

  changeTab(tabName) {
    this.setState({
      selectedTab: tabName,
    });
  }
}

export default App;
