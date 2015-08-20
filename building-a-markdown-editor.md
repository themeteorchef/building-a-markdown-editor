### Getting Started

<p class="block-header">Terminal</p>

```bash
meteor add perak:codemirror
```
To give us a fancy text editor with syntax highlighting, we'll make use of the [CodeMirror](http://codemirror.net) library which we can get access to from the [`perak:codemirror`](https://atmospherejs.com/perak/codemirror) package.


<p class="block-header">Terminal</p>

```bash
meteor add themeteorchef:commonmark
```
We'll be using the [commonmark.js](https://github.com/jgm/commonmark.js) library to parse Markdown on the server. To get access to this (and a helper function for parsing Markdown), we'll install [`themeteorchef:commonmark`](http://atmospherejs.com/themeteorchef/commonmark).

<p class="block-header">Terminal</p>

```bash
meteor add deanius:promise
```
Because we'll be chaining a few method calls, we'll use the [`deanius:promise`](https://atmospherejs.com/deanius/promise) package to help us make our method calls using the JavaScript Promises syntax.

<p class="block-header">Terminal</p>

```bash
meteor add reactive-var
```
To help us communicate the "save state" of our documents, we'll use `ReactiveVar` to reactively set state in our template.

<div class="note">
  <h3>Additional Packages <i class="fa fa-warning"></i></h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely recipe-specific additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included list</a> for Base to ensure you have fulfilled all of the dependencies.</p>
</div>

### What are we building?
So we're building a Markdown editor, but what exactly is that?

<figure>
  <img src="http://cl.ly/image/1G3P0m1x2X14/markdown-editor-preview.gif" alt="Markdown editor preview">
<figcaption>An example of the Markdown editor we'll be building.</figcaption>
</figure>

A GIF is worth a million words, friend. Pretty neat, right? We're going to build a real-time editor with a text editor on one side, and a live preview of whatever we type _in that editor_ rendered into HTML on the right. As a bonus, we'll see how to get what we've typed synced up with the the database, too, so our work is ready to go when we load the page. Not too shabby.

### What is Markdown?

Markdown is a pseudo-language for speeding up the process of writing HTML. Instead of writing out tags like `<h4>My title tag</h4>`, it allows us to use a special syntax like `#### My title tag`. Markdown is really great for things like writing blog posts because it allows you to quickly integrate different types of markup using a lean syntax. 

<p class="block-header">Markdown Example</p>

```markdown
This is just regular text.

This is **bolded text**.

This is *italicized text* and _so is this_.

This is [a link to something](http://google.com)

This is some `inline code`.
```

In fact, Markdown is powering this post! But wait...how does that work? Markdown isn't HTML, so how do browsers know how to display it?

#### Parsing Markdown
Just like any programming language needs to be converted into a more machine-friendly syntax, Markdown needs to be _parsed_ (or converted) into HTML. To do this, we can use a special tool known as a parser that follows a set of rules for converting our Markdown into raw HTML. Neat! We'll learn about this a little later on when we build a live preview for our Markdown editor.

### Creating documents
The first thing we need to do is setup our app to actually _create_ documents. To do this, we're going to setup a quick modal and load it as part of our `documents` template.

<div class="note">
  <h3>Skipping Ahead <i class="fa fa-warning"></i></h3>
  <p>We're going to skip over some of the simpler parts of this recipe like setting up a collection, templates, and routes. All of this is included in the <a href="https://github.com/themeteorchef/building-a-markdown-editor">repo over on GitHub</a>, though, so take a peek and ask questions if you get stuck!</p>
</div>

Let's hop over to the code for our `addNewDocumentsModal` template to wrap our head around it and then look at how we're accessing it from the `documents` template.

<p class="block-header">/clients/views/authenticated/add-new-document-modal.html</p>

```javascript
<template name="addNewDocumentModal">
  <div class="modal fade" id="new-document-modal" tabindex="-1" role="dialog" aria-labelledby="new-document-modal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">Start a New Document</h4>
        </div>
        <form id="new-document">
          <div class="modal-body">
            <label for="documentTitle">Document Title</label>
            <input type="text" name="documentTitle" class="form-control" placeholder="e.g. Plans for World Domination">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-success">Create Document</button>
          </div>
        </form> <!-- end #new-document -->
      </div>
    </div>
  </div>
</template>
```

Here, we're using a [Bootstrap modal](http://getbootstrap.com/javascript/#modals) to present a form for creating a new document. We're keeping things pretty spartan here and asking for just a title. There's a lot of markup here, but the part we'll focus on is the input field `<input type="text" name="documentTitle" class="form-control" placeholder="e.g. Plans for World Domination">`. [Document placeholder title](https://www.youtube.com/watch?v=oiOKh3odS4U) optional.

![Pinky and the Brain](http://media.giphy.com/media/3mKBXLpYeLzUY/giphy.gif)

One thing to point out is that because this is a modal, we expect it to _overlay_ something (as opposed to being a standalone template). Real quick, let's look at how we're including this in the `documents` template.

<p class="block-header">/client/views/authenticated/documents.html</p>

```javascript
<template name="documents">
  {{> addNewDocumentModal}}

  <h4 class="page-header">Documents</h4>

  <a href="#" class="btn btn-success add-new-document" data-toggle="modal" data-target="#new-document-modal">Start a New Document</a>

  <div class="list-group documents-list">
    {{#each documents}}
      <a class="list-group-item" href="{{pathFor 'editor'}}">{{title}}</a>
    {{else}}
      <p class="alert alert-warning">No documents yet, friend.</p>
    {{/each}}
  </div>
</template>
```

See it up there at the top `{{> addNewDocumentModal }}`? By the magic of Bootstrap, all we need to do is make sure the _markup_ for our modal is on screen by including our template and set the `data-toggle="modal" data-target="#new-document-modal"` attributes on our "Start a New Document" button. After that, Bootstrap handles the hiding/showing for us. Let's look at the logic for our modal so we can get an idea of how this is wired up.

<p class="block-header">/clients/controllers/authenticated/add-new-document-modal.js</p>

```javascript
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
```

From the bottom up! Down below, we make sure to call `preventDefault()` on our forms submission event. This blocks the form from submitting to the server, but also helps us defer the actual submission action to our validation's `submitHandler` function up above.

Our validation here is simple: does a title exist? If not, we display our `"Woah there, slick. Add a title please."` message. If all is well, we move to our `submitHandler`. In there, we grab the document title from our form and then toss it up to our `insertDocument` method on the server. Let's hop over there real quick and see how this gets in the database. 

<p class="block-header">/server/methods/insert/documents.js</p>

```javascript
Meteor.methods({
  insertDocument: function( title ){
    check( title, String );

    var doc = {
      title: title,
      owner: Meteor.userId(),
      // Note: here we have a blank space to account for our editor's loading state.
      markdown: " "
    };

    try {
      var documentId = Documents.insert( doc );
      return documentId;
    } catch( exception ) {
      return exception;
    }
  }
});
```
Pretty...underwhelming, eh? Nonetheless, very important. First, we check our `title` argument to make sure that it's a string. Next, we do something a little fancy. Instead of just inserting the document with a title only, we construct a `doc` object that we can insert. Notice, here, that we set the `title` key equal to the title we received from the client and then set two new fields: `owner` and `markdown`. 

That first one, `owner`, allows us to attach this document to the _currently logged in user_. What's nice about this is that notice we can get the user's ID on the server using `Meteor.userId()`. This helps us avoid passing the ID over from the client. We also add an empty `markdown` key with a value of a blank space. Why? This has to do with empty strings being identified as `undefined`. Later on, we'll need to set our editor's value when the page loads. Having this value as a blank space makes it a little easier for us to do this (don't worry, we'll explain later).

Lastly, we wire up our insert in a `try/catch` block. This allows us to call our insert method without a callback. Why would we do that? Well, when we do this, Meteor simply returns the new document's ID. That means we can assign that value to a variable and return it. We use a `try/catch` because if that insert were to fail for some reason, that error would be deferred to the `catch` function and returned to the client. Simple. Let's see what happens back over on the client once we have our ID. Hint: tons of fun.

<p class="block-header">/client/controllers/authenticated/add-new-document-modal.js</p>

```javascript
Meteor.call( 'insertDocument', title, function( error, response ) {
  if ( error ) {
   Bert.alert( error.reason, "danger" );
  } else {
   Router.go( "editor", { _id: response } );
   $( '#new-document-modal' ).modal( 'hide' );
   $( '.modal-backdrop' ).remove();
  }
});
```

If we get a pesky error, we toss it to [`Bert.alert()`](https://github.com/themeteorchef/bert) to let the user know what's up. If all is well, though, we grab the `response` argument from our method (this will be equal to our new document's ID) and pass it to Iron Router's `Router.go()` method. Notice how this first argument in that call is `"editor"`? This is letting Iron Router know which route we want to use by _it's name_. The latter part, where we pass an object with the `_id` key is telling Iron Router to set the route parameter for `_id` equal to our new document ID. What this does is redirect the user to our `editor` template for the new document. Confused? Let's take a look.

<p class="block-header">/client/routes/routes-authenticated.js</p>

```javascript
Router.route( 'editor', {
  name: "editor",
  path: '/documents/:_id',
  template: 'editor',
  subscriptions: function(){
    return Meteor.subscribe( 'document', this.params._id );
  },
  onBeforeAction: function(){
    Session.set( "currentRoute", "editor" );
    Session.set( "currentDocument", this.params._id );
    this.next();
  }
});
```

This is a little odd because even though our route and template are called `editor`, our path is pointed to `/documents/:_id`. Right! To keep our URL structure a little more predictable, we've opted for this path because it maps well to the list of documents. So we have `/documents` our list of documents, and `/documents/:_id` for a _single_ document. Make sense? This is purely stylistic and you could call your route whatever you wanted, like `/ryan/seriously/why/:_id`. Up to you!

Notice, though, that we want to set that `:_id` value back in our `Router.go()` call because Iron Router then passes that to our subscription for single documents, as well as sets our `currentDocument` Session variable so we can access it later. Phew.

With this done, we should be able to insert a new document and be redirected to the editor view! Yeah! Now for the sticky part: building out our editor.

### Setting up the editor
Now that we have documents stored in our database, we need to actually make them editable. How do we do it? First, let's look at our `editor` template and then build up the different pieces from there.

#### The editor template

<p class="block-header">/client/views/authenticated/editor.html</p>

```javascript
<template name="editor">
  <header class="editor-header">
    <label for="documentTitle">Title</label>
    <input type="text" name="documentTitle" value="{{document.title}}">
  </header>
  <div class="editor-preview">
    <div class="editor-wrap">
      <textarea id="editor"></textarea>
    </div>
    <div class="preview-wrap">
      <div id="preview"></div>
    </div>
  </div>
</template>
```
Now we get into the thick of it. Here, we're simply setting three things:

1. An input where we can both display and make changes to our document title.
2. A textarea with an id of `edtior` (where we'll load our CodeMirror editor).
3. An empty div with an id of `preview`.

These three parts make up our editor. We've got a good bit of work ahead of us to get them wired up. Don't worry, we'll look at all the tricky parts. First, though, let's chat about CSS.

#### The `.editor-view` class
We want our editor to look nice and spiffy and give us plenty of room for writing. To do this, we're going to add a little bit of CSS to our app, but, we only want to add that CSS when we're on the _editor_ view. How do we do that?

In Iron Router, we get access to a function called `onBeforeAction()` that can be called before every single route, or, a list of routes that we specify (or vice versa). We're going to make use of this to toggle a class on our `<body>` element whenever we're on the editor page and remove it when we're not. Let's take a peek.

<p class="block-header">/client/routes/hooks.js</p>

```javascript
var editorView = function(){
  var currentRoute = Router.current().route._path;
  if ( currentRoute === "/documents/:_id" ) {
    $( "body" ).addClass( "editor-view" );
    this.next();
  } else {
    $( "body" ).removeClass( "editor-view" );
    this.next();
  }
};
```

First, we create a function that we can call later. This is pretty simple, but quite powerful. We grab the current route's path by calling `Router.current().route._path`. In other words, this gives us the current page's path, or, everything _after_ the site's domain `http://localhost:3000`. Once we have this, we compare it against the path we're looking for as we defined it in our route: `/documents/:_id`. When the current path equals this value, it's as good as saying "we're on the editor view." Nice!

If we confirm we're in the editor view, we use a spot of jQuery to help us add a class `editor-view` to our `<body>` tag. Conversely, if we find we're _not_ on the editor path, we just go ahead and remove it. 

<div class="note">
  <h3>this.next <i class="fa fa-warning"></i></h3>
  <p>Because we'll be calling this function in Iron Router's onBeforeAction method, we need to produce a signal when our work is complete so that the router knows to continue. If we don't provide this, we'll set our class but our route won't execute leaving our page blank.</p>
</div> 

Calling this is quite simple:

<p class="block-header">/client/routes/hooks.js</p>

```javascript
Router.onBeforeAction( editorView );
```
A one liner! Here we just call `Router.onBeforeAction()`, passing our function we defined above. See how our function is the only argument? This is telling Iron Router to call this function before _every single route_. If we were to provide another argument containing an object with a key of either `except` or `only`, we could pass an array to that key with a list of route names we wanted to _avoid_ calling our function on, or isolate calling our function to, respectively. For reference:

```javascript
Router.onBeforeAction( editorView, {
  only: [
    'routeName',
    'anotherRouteName'
  ]
});
```
But wait, don't we only want to call this function on the editor view? Why not just specify that? Well, because we're setting a class name on our body, we need a way to remove it. If we were to specify `only` our editor view, when we moved away from that route the `editor-view` class would still be on the body! To get around that, we simply call our function on _all_ routes and specify the logic in our function.

<figure>
  <img src="http://cl.ly/image/3l17020m1711/markdown-editor-body-class.gif" alt="Example of editor-view class being applied while changing routes."> 
  <figcaption>Example of editor-view class being applied while changing routes.</figcaption>
</figure>

Cool! Notice how now, we can use our `editor-view` class to expand our layout to be 100% of the page to maximize our editing experience.

<div class="note info">
  <h3>Pre-Written CSS</h3>
  <p>Since we're JavaScript folk, we're going to skip over the CSS powering the editor. Don't fret, if you're curious how it's working, hop over to the repo and  <a href="https://github.com/themeteorchef/building-a-markdown-editor/blob/master/code/client/stylesheets/sass/views/authenticated/_editor.scss">check out the stylesheet</a>!</p>
</div>

### Adding CodeMirror
At this point, we've got the basic building blocks for our editor all set. Now, we want to wire up our CodeMirror editor so we can get a fancy text editor. It's surprisingly simple.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.onRendered( function() {
  this.editor = CodeMirror.fromTextArea( this.find( "#editor" ), {
    lineNumbers: false,
    fixedGutter: false,
    mode: "markdown",
    lineWrapping: true,
    cursorHeight: 0.85
  });
});
```
Wasn't kidding, was I? To initialize CodeMirror in our `editor` template, this is all of the code we need. Let's talk through it, though, as we're using an interesting technique.

Remember back in our `editor` template? Let's pull that back up again and look at how we've defined the space where we want our CodeMirror editor to go.

<p class="block-header">/client/views/authenticated/editor.html</p>

```javascript
<template name="editor">
  [...]
  <div class="editor-preview">
    <div class="editor-wrap">
      <textarea id="editor"></textarea>
    </div>
    [...]
  </div>
</template>
```

We want to pay attention to the `<textarea id="editor"></textarea>` part. In order to load our editor, we're going to make use of CodeMirror's `fromTextArea` method. Why? Because this gives us more control over placement. Because we've got some interesting CSS going on to position everything, it makes more sense to put the element where we want it. This way we can pass the selector `#editor` to CodeMirror and let it swap in the actual editor. Cool!

Back in our `onRendered` function, there are two things to note: how we're selecting our `<textarea>` and how we're passing configuration to CodeMirror. First, we're passing `this.find( "#editor" )` in as our first argument. Because we're inside of an `onRendered` callback, `this` is equal to the current template instance. This is similar to saying `template.find( '#editor' )` in one of your event handlers.

Next, we pass an object with some configuration. The good news: 99% of this isn't required and is only offered as personal preference. The one setting you _do_ want to pay attention to, though, is the `mode`. Here, we've set this to `"markdown"` so CodeMirror knows to expect Markdown and apply the correct syntax highlighting. 

With this in place, we have a functioning text editor. Now, we want to wire up our text editor so that when we make changes, it does two things:

1. Generates a live preview on the right.
2. Saves the contents of the editor to the database.

### Wiring up the preview and saving to the database

Remember toward the beginning of our recipe when we talked about parsing Markdown? This is where it comes into play. In order to generate our preview, we need to get the contents of the editor, convert it to HTML, and then apply it to the preview area.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.events({
  'keyup .CodeMirror': function( event, template ) {
    var text = template.editor.getValue();

    if ( text !== "" ) {
      Meteor.promise( "convertMarkdown", text )
        .then( function( html ) {
          $( "#preview" ).html( html );
          return Meteor.promise( "updateDocument", { _id: template.docId, markdown: text } );
        })
        .catch( function( error ) {
          Bert.alert( error.reason, "danger" );
        });
    }
  }
});
```
Woah! Lots of stuff, but it's all pretty harmless. What we're doing here is watching for the `keyup` event on our CodeMirror editor. This means that whenever our user presses a key and it (literally) goes up, we want this event to fire. Let's look at what we want it to _do_ on that event.

First, we want to grab the current value of our CodeMirror instance. To do this, we can call `template.editor.getValue();` (we get `getValue()` as a helper method from CodeMirror). Notice, here, we're grabbing our _template_ instance and accessing our CodeMirror editor from it. This is possible because when we defined our CodeMirror earlier, we bound it to `this.editor` in our `editor` template's `onRendered` callback. 

After we have our value, we need to do three things (if our editor has a value/isn't empty):

1. Convert that value from Markdown to HTML on the server.
2. Take the HTML and "set" it in our preview area.
3. Update the database with markdown.

To do all of this, we're going to make use of a handy package called `deanius:promise`. This package will help us to convert our regular Meteor method calls `Method.call()` into chainable, [JavaScript promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Promises are neat because they allow us to call asynchronous functions in a synchronous manner. In essence, they allow us to say "do this, and then do this, and then do this, and if any errors happen...do this." Because of this, too, we get a much cleaner syntax saving us from "callback hell." Shall we?

First, we call `Meteor.promise( "convertMarkdown", text )`, which is like saying `Meteor.call( "convertMarkdown", text, function(){} );` Notice, though, that we leave off a semicolon (this is so we can chain our calls) as well as a third argument in the form of a callback function. This starts our chain. We're saying, "okay, Meteor, call our `convertMarkdown` method and pass it the text from our CodeMirror editor." Let's hop over to the server to check out our `convertMarkdown` method and then come back to see how the chaining works.

<p class="block-header">/server/methods/utility/markdown.js</p>

```javascript
Meteor.methods({
  convertMarkdown: function( markdown ){
    check( markdown, String );
    return parseMarkdown( markdown );
  }
});
```

Seriously?! Yep. Thanks to your pal The Meteor Chef and his package `themeteorchef:commonmark`, this all the code we need to convert our Markdown into HTML and return it back to the server. Note: I can't take full credit here, as the _real_ work was done by the [commonmark.js](https://github.com/jgm/commonmark.js) folks. The "package" is just a function that calls the right methods to spit out some HTML. _Wipes brow_. All in a hard days work, amiright?

<div class="note info">
  <h3>What is CommonMark?</h3>
  <p>As the authors put it "CommonMark is a rationalized version of Markdown syntax, with a spec and BSD-licensed reference implementations in C and JavaScript." This means that Markdown is an interpretation of Markdown and commonmark.js is the tool used to convert Markdown into HTML <em>following that interpretation</em>.</p>
</div>

With our HTML ready to rock, back on the client we can take that HTML and inject it into our `#preview` div. Let's take a look.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Meteor.promise( "convertMarkdown", text )
  .then( function( html ) {
    $( "#preview" ).html( html );
    return Meteor.promise( "updateDocument", { _id: template.docId, markdown: text } );
  })
```

See what's happening here? Using the Promises syntax, we're "chaining" on a callback function to be called _after_ our `convertMarkdown` method has returned a value. That value, then, becomes accessible as part of the callback function. Here, we've denoted the value as the `html` argument in the callback. Pretty cool, right? To get our live preview, it's just a one liner: `$( "#preview" ).html( html );`. Neat! With this, we can now type in the editor in Markdown and get a _live preview_ rendered in HTML.

![Whaaaat](http://media0.giphy.com/media/i9nkolRQgbN9C/giphy.gif)

We're not done  yet! Notice that return value? Here, we're calling to another method `updateDocument`, again, with a promise. Let's jump up to the server to see what we're working with.

<p class="block-header">/server/methods/update/documents.js</p>

```javascript
Meteor.methods({
  updateDocument: function( changes ){
    check( changes, {
      _id: String,
      markdown: Match.Optional( String ),
      title: Match.Optional( String )
    });

    var doc = changes._id;
    delete changes._id;

    try {
      var documentId = Documents.update( doc, {
        $set: changes
      });
      return documentId;
    } catch(exception) {
      return exception;
    }
  }
});
```

Very similar to our `insertDocument` method from earlier. We need to call attention to our `check()` method. Here, we're being a little bit crafty and making our method super flexible. Notice how we're pulling in our `changes` argument and comparing it to an object? Normally, this would mean that every time we call an update, we'd need all of the keys in that object to be present. Aha! Instead of doing that, we can make use of the `Match.Optional()` method. This tells our `check()` that these fields are optional, but if they _are_ included, they should be a `String` type. Ok, what's the point?

This affords us the ability to reuse this method in multiple spots. Really in our app we only have two: our Markdown editor and our title (we've skipped over this but our editor and our title fields use this method to update the document). Instead of two separate methods, this technique lets us keep everything light. Great! Notice, too, that instead of having to pluck specific fields to pass to our `Documents.update()` method's `$set` value, we can simply pass our entire `changes` argument because we know it's only ever going to contain the fields we need to update (except for the `_id` field, we go ahead and snip that off first). Nerd points x1000. 

Once this is in place, we can hop back to the client. Hint: get your party hat ready.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.events({
  'keyup .CodeMirror': function( event, template ) {
    var text = template.editor.getValue();

    if ( text !== "" ) {
      Meteor.promise( "convertMarkdown", text )
        .then( function( html ) {
          $( "#preview" ).html( html );
          return Meteor.promise( "updateDocument", { _id: template.docId, markdown: text } );
        })
        .catch( function( error ) {
          Bert.alert( error.reason, "danger" );
        });
    }
  }
});
```

Done! We now have a working text editor complete with live preview. This means that whenever we type in our editor on the left, we'll see the live, rendered result on the right. Pretty rad. Here's a zinger for you, though. What happens when we refresh the page?

Oh no!

### Setting content on page load

You may be wondering why we don't just set the value of our editor and our preview with template helpers. Fair question! 

On the editor side, we don't want to do this because it would be like sitting in a chair and having someone constantly pulling it out from under us. Think about it. If the value of our editor is equal to whatever is in the database, when the database updates (on every `keyup` event), we're resetting the contents of the editor. The problem with this arises around cursor position. We find that a few edits are fine, but so many cause the cursor to jump to the end of the editor or even the start. Weird! 

On the preview side, this is more of a "less is more" type of setup. Again, because we're updating our database on each `keyup` event, it could get pretty gnarly if we were also _reading_ that on each keyup event. It's not the end of the world, but it's also not necessary to constantly poll the database because we know our preview is based on whatever is in our editor (which is synced with the database). Make sense?

To help us solve this, we've created a little helper function called `initEditor()` that we can call in our `editor` template's `onRendered` callback:

<p class="block-header">/client/</p>

```javascript
Template.editor.onRendered( function() {
  [...]
  initEditor( this );
});
```

Hot damn! Nice and simple. Here we call our `initEditor()` function passing `this` (the current template instance) as an argument. Easy. Let's look at the code behind `initEditor` to see how it works.

<p class="block-header">/client/helpers/helpers-editor.js</p>

```javascript
initEditor = function( template ) {
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

      template.editor.setValue( doc.markdown.trim() );

      computation.stop();
    }
  });
};
```

Nothing _too_ crazy. First, our function opens with a `Tracker.autorun()` call. What's that about? Well, because we may not have access to any data yet when our template renders (remember this is being called from within `onRendered`), we need to keep trying until we do. Tracker.autorun() makes this possible outside of our normal helpers context which _is_ reactive.

Inside, we do a `Documents.findOne()` to locate the current document. Because we're only publishing a single document equal to the current document ID in the URL, we can get away with this. Notice, too, that we set up a projection to only give us the `markdown` field. 

This is where our autorun becomes handy. With our query set up, now we need to wait until we're sure we have a value. We make sure by saying if `doc` and `doc.markdown`: go nuts.

Once we've confirmed we have some sort of Markdown string, we call to our `convertMarkdown` method to convert to HTML and on success we set our preview's HTML equal to the freshly converted Markdown. Note, too, just before we stop our computation that we set the value of our editor equal to the raw Markdown. Why the `trim()`?

Remember earlier when we inserted our document and set the markdown field's initial value to `" "`? This is where it comes into play. If when we first created a document and _didn't_ have this, our editor would be set with a blank space, meaning our documents would always start with a gap. No good! This simply "trims" off any blank space at the end of a string, or, our single blank space.  

<div class="note">
  <h3>Undefined With Strings</h3>
  <p>This caught me off guard. Unfortunately, if a string is simply empty, or, "", JavaScript will evaluate it to a falsy value. Because we need to check for its existence on the client, we get around this by setting the default value to a blank space to "trick" our if statement into running properly. Funky, I know.</p>
</div>

Ultimately this little trick saves us some headaches with the editor's cursor jumping around when we first start editing and getting some weird `Tracker` errors saying our `markdown` field is undefined. So it goes.

One last thing to point out: `computation.stop()`. Notice that we get our `computation` value as an argument in our `Tracker.autorun()`'s callback function. Recall that we only want this to run until we have a value. After it's set, we don't want this code running again so we use the `.stop()` method to completely cancel out our computation. Now, even if changes are made to our document in the DB, nothing will happen.

If we refresh now (or move between pages), we'll see that our editor _and_ preview populate as expected on page load. High five!

### Saving state
Technically we're done. But we're never done. One little touch that we can add to this is a saving state. If you've ever used Google docs, you may have noticed that they show a little `Saving...` state if you're typing and `Saved` if you've stopped. This is a nice touch to have because technically our user doesn't know if their work is being saved without it. Let's put our UX cap and get this added in.

<p class="block-header">/client/views/authenticated/editor.html</p>

```markup
<template name="editor">
  <header class="editor-header">
    [...]
    {{#if saving}}
      <span class="save-state"><i class="fa fa-frefresh fa-spin"></i> Saving...</span>
    {{else}}
      <span class="save-state text-success"><i class="fa fa-check"></i> Saved!</span>
    {{/if}}
  </header>
  [...]
</template>
```
Back in our `editor` template, we add a little block to our `<header class="editor-header">` element. Here, we add a simple if/else statement that spits out an icon depending on which "state" we're in. If we're saving, we show `Saving...` with an icon. If not, we show `Saved!` with an icon. To handle the state, we're going to make use of `ReactiveVar`s.

#### Adding ReactiveVar to our template
To get this working, we need to change a few things. First, we need to _create_ a `ReactiveVar` when our template is created. Let's take a peek.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.onCreated( function() {
  this.saveState = new ReactiveVar();
});
```
Nice and simple! Here, we just attach our ReactiveVar to a variable [on our template's instance](http://themeteorchef.com/snippets/reactive-dict-reactive-vars-and-session-variables/#tmc-reactive-variables). Now, within any of our template logic, we can get access to the value of `saveState`. As the name suggests, too, it's reactive! This means that if it changes, anything dependent on it will change, too. Next up is a helper to toggle our two icons/states in the editor header.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.helpers({
  [...]
  saving: function() {
    var saveState = Template.instance().saveState.get();
    return saveState;
  }
});
```

Boom! Because we've attached our `ReactiveVar` to our template instance, we can get access to it in our helper by calling `Template.instance().saveState.get()`. This is similar to a Session variable, but [keeps everything local to the template](http://themeteorchef.com/snippets/reactive-dict-reactive-vars-and-session-variables/#tmc-when-to-use-reactive-varsdict-vs-session-variables) and the _instance_ of that template. Win! Now...one last step. We need to _set_ our variable when something happens.

<p class="block-header">/client/controllers/authenticated/editor.js</p>

```javascript
Template.editor.events({
  'keyup .CodeMirror': function( event, template ) {
    [...]

    template.saveState.set( true );

    if ( text !== "" ) {
      Meteor.promise( "convertMarkdown", text )
        .then( function( html ) {
          $( "#preview" ).html( html );
          return Meteor.promise( "updateDocument", { _id: template.docId, markdown: text } );
        })
        .then( function() {
          delay( function() {
            template.saveState.set( false );
          }, 1000 );
        })
        .catch( function( error ) {
          Bert.alert( error.reason, "danger" );
        });
    }
  },
});
```

Back in our `keyup` event, we can see that we've added a line just above our Promise chain `template.saveState.set( true );`. This just toggles the state of our variable so that in our template, instead of `Saved!` it reads `Saving...`. Notice, this is happening while we're _typing_. So if we're typing, we see `Saving...` and after our database write has completed we see `Saved!`. The latter part of that—switching back to `Saved!`—is handled through an additional step in our Promise chain. Notice we add an additional `then()` call with a function that sets our `saveState` back to false. 

That `delay` function may look a little funky. What is that? We've added that here to compensate for [how JavaScript's timing functions work](http://ejohn.org/blog/how-javascript-timers-work/). We need a way to   consistently set and cancel our event because we'll be calling this repeatedly while typing. This delay function helps us prevent our `setTimeout` loops from tripping over one another, toggling the save state in unpredictable ways. The school bell is about to ring, though, so consider reviewing that as [extra credit](https://github.com/themeteorchef/building-a-markdown-editor/blob/master/code/client/helpers/helpers-functions.js).

### Wrap Up & Summary

Ring! Ring! Ring! That's all folks. In this recipe we learned how to build a Markdown editor complete with live preview and saving to the database. We learned about using a Markdown parser, adding a CodeMirror editor to our app, and even learned how to use `ReactiveVar`. We also looked at using keyboard events to control when and how we perform certain functions, as well as how to use `Tracker.autorun` to get a wrangle on reactivity.