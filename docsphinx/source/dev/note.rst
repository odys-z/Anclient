Design Note
===========

Level up AnTablist's selected rows
----------------------------------

Table rows with checkbox (or can row selectable) need a set to remember weather
a row is selected.

ReacJs recommend a way of firing events to parent with callbacks, updating children
with setState(). So if a table's selected rows must cleared by other components,
the selected rows must be updated by parent. So selected rows' state is level upped
using prop selected, with a set named ids. <AnTablistLevelUp /> will update the set.

.. code-block:: javascript

    import { AnTablistLevelUp } from 'anclient';

    class Foo extends CrudCompW {
        state = {
            selected: {ids: new Set()}
        }
    }

    notifiedHandler() {
        this.state.ids.clear();
        this.state.setState({});
    }

    onSelected() {
        console.log(this.state.selected.ids);
    }

    render() {
        return (
            <AnTablistLevelUp
              columns={[]} rows={[]}
              selected={this.state.selected}
            />);
    }
..
