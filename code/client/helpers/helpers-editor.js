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

    if ( doc && doc.markdown ) {

      Meteor.call( "convertMarkdown", doc.markdown, function( error, html ) {
        if ( error ) {
          console.log( error.reason );
        } else {
          $( "#preview" ).html( html );
        }
      });

      // Note: here, we account for the potential "blank space" value on default
      // by using the trim() method on our string. This way when we load up for
      // the first time, our editor doesn't just have a blank space. Sneaky!
      template.editor.setValue( doc.markdown.trim() );

      computation.stop();
    }
  });
};
