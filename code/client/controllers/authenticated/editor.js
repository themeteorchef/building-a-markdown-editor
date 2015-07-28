Template.editor.onCreated( function() {
  // Here, we create a ReactiveVar to track the "save state" of our document.
  this.saveState = new ReactiveVar();
});

Template.editor.onRendered( function() {
  // Store our current document's ID on the template for later.
  this.docId = Session.get( "currentDocument" );

  // Initialize our CodeMirror editor (where we type out Markdown). Notice here,
  // we're assigning this to our template instance so we can access it throughout
  // our template. Party!
  this.editor = CodeMirror.fromTextArea( this.find( "#editor" ), {
    lineNumbers: false,
    fixedGutter: false,
    mode: "markdown",
    lineWrapping: true,
    cursorHeight: 0.85
  });

  // To understand what this is and how it works, open up:
  // /client/helpers/helpers-editor.js (the initEditor() function is annotated).
  //
  // It's also explained in the recipe :)
  initEditor( this );
});

Template.editor.helpers({
  document: function(){
    var getDocument = Documents.findOne();

    if ( getDocument ) {
      return getDocument;
    }
  },
  saving: function() {
    var saveState = Template.instance().saveState.get();
    return saveState;
  }
});

Template.editor.events({
  'keyup .CodeMirror': function( event, template ) {
    var text = template.editor.getValue();

    template.saveState.set( true );

    // For good measure, make sure we're not inserting a blank string. This saves
    // us some unnecessary work but also prevents running into an "undefined" error
    // if we save the blank string to the database.
    if ( text !== "" ) {

      // Here, we use the deanius:promise package to chain our calls. Why? Well,
      // we need to call two methods here: one to convert our markdown to HTML on
      // the server and get it back so we can update our preview, and then another
      // to actually save our Markdown to the database. This package, using JavaScript
      // promises, allows us to chain our method calls so our code is a little cleaner
      // and we don't have to get caught up in "callback hell."

      Meteor.promise( "convertMarkdown", text )
        .then( function( html ) {
          $( "#preview" ).html( html );
          return Meteor.promise( "updateDocument", { _id: template.docId, markdown: text } );
        })
        .then( function() {
          delay( function() {
            // After a short delay, set our "saving" state to "Saved!"
            template.saveState.set( false );
          }, 1000 );
        })
        .catch( function( error ) {
          Bert.alert( error.reason, "danger" );
        });
    }
  },
  'blur [name="documentTitle"]': function( event, template ) {
    var title = $( event.target ).val();

    // Embellish our "saving" event a little bit.
    template.saveState.set( true );

    // Here, since we're only calling a single method, we just use a vanilla
    // Meteor.call().

    Meteor.call( "updateDocument", { _id: template.docId, title: title }, function( error, response ) {
      if ( error ) {
        Bert.alert( error.message, "danger" );
      } else {
        delay( function() {
          // After a short delay, set our "saving" state to "Saved!"
          template.saveState.set( false );
        }, 1000 );
      }
    });
  }
});
