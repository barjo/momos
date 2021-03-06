/* global $, Exception, console*/

/**
 * Handle new form creation
 *
 * @class NewFormManager
 * @extends HUBU.AbstractComponent
 */

function NewFormManager() {
    "use strict";

    var self = this;
    var _hub;
    var _newForm;
    var _url = "/form/type";

    var _hash;

    self.name = "NewFormManager";

    self.getComponentName = function() {
        return self.name;
    };

    self.newFormRender = null; //RactiveRenderService - TodoListRender

    /**
     * Configure the instance of the TodoListController.
     *
     * @method configure
     * @param {HUBU.hub} theHub
     * @param conf - The TodoListController configuration.
     * @param {map} conf.model - The model link to this TodoListController
     * @param {string} [conf.url='/list'] - The root URL of the todo lists
     */
    self.configure = function(theHub, conf) {
        _hub = theHub;

        if (typeof conf == "undefined") {
            throw new Exception("The NewFormManager configuration is mandatory.");
        }

        if (typeof conf.model !== "object") {
            throw new Exception("The model entry is mandatory.");
        }

        //Check with a regexp
        if (typeof conf.url === "string") {
            _url = conf.url;
        }

        _newForm = conf.model;

        //Track the path change
        _hub.subscribe(this,"/path/change",pathChange);

        _hub.requireService({
            component: this,
            contract: window.RactiveRenderService,
            field: "newFormRender"
        });
    };

    function pathChange(event){
        console.log("Hash "+event.path);
    }

    function encodeIdURL(root,id){
      return root+"/"+id.replace("#","%23").replace(":","%3A");
    }

    /**
     * Add a new text entry to the form
     * @param event - The Ractive event
     */
    function addTextEntry(event){
        _newForm.entries.push(
            {
                label: 'New Question',
                type: 'Text',
                choices : [],
                info: ''
            }
        );
    }

    function addOption(event){
        _newForm.entries[_newForm.selected].choices.push({name: 'New Option'});
    }

    function removeOption(event,index){
        _newForm.entries[_newForm.selected].choices.splice(index,1);
    }

    function moveUp(event,index){
        if(_newForm.entries.swap(index,index-1)){
            //update the focus/selected entry
            self.newFormRender.set("selected",index-1);
        }
    }

    function moveDown(event,index){
        if(_newForm.entries.swap(index,index+1)){
            //update the focus/selected entry
            self.newFormRender.set("selected",index+1);
        }
    }

    /**
     * Remove a previously created entry
     * @param event - The Ractive event
     * @param index - the entry index
     */
    function removeEntry(event,index){
        self.newFormRender.set("selected",-1); //clear selected
        _newForm.entries.splice(index,1);
    }

    function saveNewForm(event){
        $.ajax({
            type: "PUT",
            contentType: "application/json; charset=UTF-8",
            url: _url,
            data: JSON.stringify(_newForm)
        }).done(function(data) {
            //_newForm.todos.push(data);
            console.log(data);
        });
    }

    self.start = function() {
        self.newFormRender.render();

        //bind the event
        self.newFormRender.on("addTextEntry", addTextEntry);
        self.newFormRender.on("removeEntry", removeEntry);
        self.newFormRender.on("addOption", addOption);
        self.newFormRender.on("removeOption", removeOption);
        self.newFormRender.on("moveUp", moveUp);
        self.newFormRender.on("moveDown", moveDown);
        self.newFormRender.on("saveNewForm", saveNewForm);
    };

    self.stop = function() {
        self.newFormRender.unrender();
    };
}
