initEditor = function( template ) {
  // This might be confusing. Here, we want to wrap our actions in a
  // Tracker.autorun() because we may run into a situation where our data isn't
  // ready yet and therefore never sets. This wrapper allows us to say, "okay,
  // Meteor, wait until you have data, and then set our editor and preview."
  //
  // Notice, we grab the autorun's computation to stop it *after* we've set our
  // data. This helps us prevent constantly resetting the editor's contents.
  Tracker.autorun( function( computation ) {
    var doc = Documents.findOne( {}, { fields: { "markdown": 1 } } );

    // We make sure to test based on length of our Markdown string and not just
    // the existence of it. The reason for this is that this statement will
    // evaluate to false if the string is empty (it would be by default). This
    // allows us to avoid a weird loop where our computation.stop() doesn't fire
    // correctly, because it's inside of this evaluation.
    if ( doc && doc.markdown.length > -1 ) {

      Meteor.call( "convertMarkdown", doc.markdown, function( error, html ) {
        if ( error ) {
          console.log( error.reason );
        } else {
          $( "#preview" ).html( html );
        }
      });

      template.editor.setValue( doc.markdown );

      computation.stop();
    }
  });
};
