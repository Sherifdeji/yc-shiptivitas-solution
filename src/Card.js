import React from "react";
import "./Card.css";

export default class Card extends React.Component {
  render() {
    const { id, name, status } = this.props;
    return (
      <div className="Card" data-id={id} data-status={status}>
        <div className="Card-title">{name}</div>
      </div>
    );
  }
}
