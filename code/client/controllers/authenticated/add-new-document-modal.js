Template.addNewDocumentModal.onRendered( function() {

  $( "#new-document" ).validate({
    rules: {
      documentTitle: {
        required: true
      }
    },
    messages: {
      documentTitle: {
        required: "Woah there, slick. Add a title please."
      }
    },
    submitHandler: function() {

      var title = $( "[name='documentTitle']" ).val();

      Meteor.call( 'insertDocument', title, function( error, response ) {
        if ( error ) {
          Bert.alert( error.reason, "danger" );
        } else {
          Router.go( "editor", { _id: response } );
          $( '#new-document-modal' ).modal( 'hide' );
          $( '.modal-backdrop' ).remove();
        }
      });
    }
  });

});

Template.addNewDocumentModal.events({
  'submit form': function( e ) {
    e.preventDefault();
  }
});
