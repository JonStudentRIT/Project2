const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

let id;
//------------
const socket = io();

const handleEditBox = () => {
    const editForm = document.getElementById('editForm');
    const editBox = document.getElementById('editBox');
    const channelSelect = document.getElementById('channelSelect');

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if(editBox.value) {            
            const data = {
                message: `${editBox.value}`,
                channel: channelSelect.value,
            };

            socket.emit('chat message', data);
            editBox.value = '';
        }
    });
};

const displayMessage = (msg) => {    
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<h1>${msg}</h1> <p>${msg}</p>`;
    document.getElementById('messages').appendChild(messageDiv);
}

const handleChannelSelect = () => {
    const channelSelect = document.getElementById('channelSelect');
    const messages = document.getElementById('messages');
    channelSelect.addEventListener('change', () => {
        messages.innerHTML = '';

        switch(channelSelect.value) {
            case 'memes':
                socket.off('general');
                socket.on('memes', displayMessage);
                break;
            default:
                socket.off('memes');
                socket.on('general', displayMessage);
                break;
        }
    });
}
//------------

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const backstory = e.target.querySelector('#domoBackstory').value;

    if(!name || !age || !backstory)
    {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, backstory}, loadDomosFromServer);

    return false;
};

// delete function 
const deleteDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    // empty string check
    if(id) {
        // go to the helper to send an update 
        helper.sendDelete(e.target.action, {id}, loadDomosFromServer);
    }

    return false;
  };

const DomoForm = (props) => {
    return (
        <form id = "domoForm"
            onSubmit = {handleDomo}
            name = "domoForm"
            action = "/maker"
            method = "POST"
            className = "domoForm"
            >
                <lable id = "domoNameLabel" htmlFor = "name">Name: </lable>
                <input id = "domoName" type="text" name = "name" placeholder = "Domo Name" />
                <br />
                <label id ='domoAgeLabel' htmlFor = "age">Age: </label>
                <input id = "domoAge" type="number" min = "0" name = "age" />
                <br />
                {/*adds larger field for more explanation about the domo pt1 */}
                <lable id = "domoBackstoryLabel" htmlFor = "backstory">Backstory: </lable>
                <textarea id = "domoBackstory" rows="6" cols="30"  name = "backstory" >
                    Tell the story of your Domo
                </textarea>
                <br />
                <input id = "submitButton" className = "makeDomoSubmit" type="submit" value = "Make Domo" />
            </form>
    );
};

const DomoList = (props) => {
    if(props.domos.length === 0) {
        return (
            <div className = "domoList">
                <h3 className = "emptyDomo">No Domos Yet!</h3>
            </div>
        )
    };
    const domoNodes = props.domos.map(domo => {
        return (
            <div key = {domo._id} className = "domo">
                <div>
                    <img src = "/assets/img/domoface.jpeg" alt = "domo face" className = "domoFace" />
                    <h3 className = "domoName">Name: {domo.name} </h3>
                    <h3 className = "domoAge">Age: {domo.age} </h3>
                </div>
                {/* description of the domo is seperate from the name and age */}
                <div>
                    <h3 className = "domoBackstory">Backstory: {domo.backstory}</h3>
                </div>
                <div>
                {/* add a button to delete a domo */}
                <form
                    // call the delete function
                    onSubmit = {deleteDomo}
                    action = "/delete"
                    >
                        {/* _id and the index of the domo thats diplayed need to match */}
                        {/* this is where the domo _id is collected for the comparison in deleteOne() from controllers */}
                        <input id = "submitButton" onClick = {()=>{id=domo._id}} type="submit" value = "Delete" />
                    </form>
                </div>
            </div>
        );
    });
    return (
        <div className = "domoList">{domoNodes}</div>
    )
};

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(<DomoList domos = {data.domos} />, document.getElementById('domos'));
};

const init = () => {
    ReactDOM.render(<DomoForm />, document.getElementById('makeDomo'));
    ReactDOM.render(<DomoList domos = {[]} />, document.getElementById('domos'));
    loadDomosFromServer();
    //---------
    handleEditBox();
    socket.on('general', displayMessage);
    handleChannelSelect();
    //---------
};

window.onload = init;