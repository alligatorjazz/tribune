# Tribune
Tribune seeks to provide a few quality-of-life features to speed up the process of designing and blogging on Neocities - or any static site hosting provider of your choice.


> [!WARNING]
> Tribune is still very much in beta (< 1.0.0) - there will be bugs! Before downloading, make sure you make a backup of your site first.

# Quick Start

> ❗️ **Note:** Tribune assumes the landing page of your site is a file in your site's root titled `index.html`. If this isn't the case, rename your landing page to this before continuing - otherwise Tribune won't run.

1. [Download](/download) the latest version of Tribune for your operating system.
2. Unzip the Tribune executable (`tribune` for MacOS and Linux, `tribune.exe` for Windows) and **place it in the root folder of your site.**
3. Double-click the Tribune executable and it should start running! **Make sure to read the built-in instructions that follow carefully before pressing Enter to continue.**
4. After you press enter, it'll open up a preview of your site in your default browser!

# Features

## Widgets

Tribune allows you to build widgets - reusable pieces of html that you can place throughout your site like any other element.

### How To Create a Widget

1. To create a widget, make an new html file in your site's "/widgets" folder. (Tribune should have created this for you if it didn't exist yet.) Place some tags inside!

```html
<!-- example: widgets/widget-name.html -->
<p>This text is being placed by a widget!</p>
```

2. Place some html within the widget. Then, when you want to use it in your site, reference it like this:

```html
<widget-name></widget-name>
```

3. The content of the widget should appear wherever you placed it on the page! If you're wondering what widgets look like in action, just look at this site's navbar - it's being placed on every page using a widget!

### How To Style A Widget

The widget will appear on your page as a `div` element with a data attribute denoting its name, like this:

```html
<div data-widget="widget-name">
	<!-- content goes here -->
</div>
```

You can select a widget for styling using a `data-widget` selector, like so:

```css
[data-widget="widget-name"] {
	/* styles go here */
}
```

## Markdown

Tribune provides you the ability to write your site's pages in Markdown. For those unaware, Markdown is an extremely minimal markup language designed to let your write web content in the same way as you'd write text normally.

Writing text-heavy portions of your site in Markdown is several orders of magnitude faster and more convenient than trying to do so in HTML, and Tribune seeks to allow you to do so easily (case in point: this very page is written in Markdown!)

> 💡 **Info:** For more information about Markdown specifically, see [markdownguide.org](https://www.markdownguide.org/getting-started/).

To write pages in Markdown, first you must create a **template**. Templates are normal HTML pages in every way except for one: they have access to several built-in widgets that allow you to tell Tribune where to put Markdown content.

For example, the "docs" template that is used for this guide pages is below:

```html
<!-- /templates/docs.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Tribune</title>
	<link rel="stylesheet" href="/styles/core.css" />
	<link rel="stylesheet" href="/styles/docs.css" />
  </head>
  <body>
	<nav-bar></nav-bar>
	<article>
	  <markdown-body></markdown-body>
	</article>
  </body>
</html>
```

That's it. It's a normal HTML page in every way except that it's using two widgets: `<nav-bar>`, which is the widget for this site's nav-bar, and then `<markdown-body>`, which is a built-in widget that tells Tribune "put the Markdown content here."

To tell Tribune what template to use, you use what's called **frontmatter** in your Markdown file. Here's an example from `guide.md`, the file this page was generated from:

```
<!-- guide.md -->
---
<!-- frontmatter goes between the dashes! -->
template: docs
---
<!-- content starts below -->
# Quick Start 

> ❗️ **Note:** Tribune assumes the landing page of your site is a file in your site's root titled `index.html`. If this isn't the case, rename your landing page to this before continuing - otherwise Tribune won't run.

<!-- ...the rest of the content -->

```

First, you make the Markdown file (`guide.md` in this case), then, you simply write your frontmatter in the format `[property]: [value]` fenced in between three dashes (`template: docs`, in this case).

That's it! Now, I can apply styles to my Markdown files like any other HTML file. If you want to know what Markdown features translate to which HTML elements in order to style them, you can see a list [here](https://www.markdownguide.org/basic-syntax/). (You can also open the source code of this page in your browser's developer tools and just look with your eyeballs, if you prefer that.)

## Blogging

All of the features discussed in the [Markdown](#Markdown) section also help with blogging, but there are several additional features that Tribune provides that are specifically intended to ease the process of blogging on Neocities.

### Widgets for Blogging

In addition to the built-in`<markdown-body>` widget, there's also `<markdown-title>`, `<markdown-date>`, and `<markdown-description>`. The job of these widgets is to take information from your Markdown frontmatter and place them on the page as style-able items. For example, here is the "post" template for this site:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Tribune</title>
	<link rel="stylesheet" href="/styles/core.css" />
	<link rel="stylesheet" href="/styles/docs.css" />
  </head>
  <body>
	<nav-bar></nav-bar>
	<article>
	  <markdown-title></markdown-title>
	  <markdown-date></markdown-date>
	  <markdown-description></markdown-description>
	  <markdown-body></markdown-body>
	</article>
  </body>
</html>
```

As you can see, it's basically exactly the same as the "docs" template, only with the additional blogging widgets. The blogging widgets all appear on the finished side as `<div>` tags with the class `markdown-[property]` - so `<markdown-title>` can be styled by selecting `div.markdown-title`, `<markdown-date>` can be styled by selecting `div.markdown-date`, and so on.

> 💡 **Info:** Templates don't care whether they're being used on a blog post or on some other type of Markdown page. They're always referenced the same way: `template: [template-name]` in your frontmatter.

### The <post-list> widget

The built-in `<post-list>` widget has only one job: give you a list (in the form of a `<ul>` tag) with all your blog posts in it. To find out what Markdown files are supposed to be blog posts, Tribune looks for a "posts" folder in your site's root, and it assumes every Markdown file in there is a blog post. It's that simple.

> ❗️ **Note:** Tribune doesn't assume you're a blogger, so it doesn't create this folder for you. You can create it at any time, though.

The reason why the "posts" folder is important is because the `<post-list>` folder will use it to create its list of posts. The widget will try its best to sort the posts in reverse-chronological order based on the "date" field in their frontmatter and then places an `<li>` item for each one containing the post title, date, and description - with all three of them being wrapped in an `<a>` tag that links to your post.

For the moment, the widget doesn't support more advanced organization like tags or pagination, but those many come in future releases (and some simple CSS and JS may solve your immediate problems in the meantime).

### RSS
Tribune can automatically generate an RSS feed for your blog, but it requires just a tiny bit of configuration.

When Tribune first launches, it will create a file in your root folder called `tribuneconfig.json`. This file lets you configure certain options for Tribune, including your RSS feed. By default, the file looks like this: 
```jsonc
{
	"rss": {
		// "title": "your blog's title!",
		// "link": "your blog's link!",
		// "description": "your blog's description!"
	}
}
```

In order to set up your feed, just uncomment (remove the double slashes at he beginning) the three lines within the `rss` object - then, fill them in as follows:
- `title`: The title of your site or blog.
- `link`: The base url for your site or blog. In most cases, this should be `https://[your-username].neocities.org`. For those with custom domains, it'll be `https://[your-custom-domain].[your-TLD]`.
- `description` (optional): The description for your site or blog. This property is optional - if you don't pick one, Tribune will simply set it to `The RSS feed for [your-site-domain]`.

Once you've set those properties, reset Tribune and it should spit out a working `rss.xml` for your blog that you can use as an RSS feed. The `rss.xml` will be automatically populated with any posts in your `posts` folder.

# Philosophy

## Who is Tribune for?

Tribune is for amateur web designers who want to speed up the process of writing, managing, and publishing content on their personal sites _without_ sacrificing the creative control over their site's design, layout, and scripts.

One thing that I've noticed browsing Neocities is that while people like having direct control over their site as a form of creative expression, most folks on Neocities are not professional-level programmers. This means that there's a great deal of friction between "having a cool idea you want to share with folks" and "actually publishing that idea in a consistent and convenient way." It doesn't take a while browsing Neocities before finding someone who has a status update along the lines of this:

> "Sorry I haven't updated in so long! I haven't had the motivation to post recently because editing this site is such a huge pain in the ass!

By default, raw HTML / CSS / JS are pretty terrible at making layouts that are modular, composable, or reusable. Professional web developers have an extremely wide array of tools to solve those problems, but we often forget that setting up those toolchains can be extremely intimidating for those less experienced with programming. There are a ton of pitfalls for total amateurs that we often forget about:

1. Most modern computer users have _never_ used the command line on their system even once. If they have ever seen it done, they regard it as a strange and alienating kind of techno-wizardry.
2. Many web dev tools have a sort of implicit "Unix-chauvinism" (translation: they're designed primarily MacOS and Linux users), and many casual computer users are on Windows. Again, it's no problem for professional developers to configure things for Windows specifically, or even use tools like the [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), but casual computer users are not going to have the confidence or knowledge to do this. Have you ever tried to teach a bunch of newbies how to get NPM installed on Windows? I have. It's not easy.
3. In the process of configuring your average web dev project with a modern framework, it's very normal to be juggling up to six or seven different languages: Javascript, Typescript, Sass, TOML, YAML, JSON, Markdown, or some other ungodly combination of the bunch. There is a desperate need for zero-configuration amateur tools that work out of the box without needing to install a thousand different dependencies and CLIs.

And, so, I present what is hopefully a solution for that niche of people who are experienced enough to write basic web markup but aren't ready to tackle a proper professional-grade framework: Tribune.

## Who is Tribune _not_ for?

1. **Professional web developers.** If you do this as a job, or even if you're an advanced-level hobbyist, your normal tool chain is going to be far superior to any version of Tribune that will ever exist. If you're looking for a new framework, I can heartily recommend [Astro](https://astro.build/) - I use it for every project I can (except this site, which I obviously use Tribune for instead).
2. **Complete HTML/CSS newbies.** You're at least going to want a decent understanding of the absolute basics of HTML/CSS. Luckily, Neocities has [a great tutorial](https://neocities.org/tutorial/html/1) for this purpose exactly.
3. **People already using workflows that have complex build steps.** Tribune pretty much assumes it's the only thing in your site folder building and transforming files. If you're trying to compile Typescript, Sass, or some other intermediate language, you're probably better off going with a proper web framework.
