Meteor.methods({
  convertMarkdown: function( markdown ){
    // Check the argument. Assuming a String type here.
    check( markdown, String );
    return parseMarkdown( markdown );
  }
});
