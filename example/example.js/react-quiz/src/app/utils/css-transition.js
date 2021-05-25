import React from "react";
import { TransitionGroup } from "react-transition-group";

export default elem => {
    return (
        <TransitionGroup
            transitionName="mainApp"
            transitionAppear={true}
            transitionEnterTimeout={500}
            transitionAppearTimeout={500}
            transitionLeave={false}
            transitionLeaveTimeout={500}
        >
            {elem}
        </TransitionGroup>
    );
};
