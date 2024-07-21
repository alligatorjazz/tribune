---
template: docs
---

# Quick Start
> ❗️ **Note:** Tribune assumes the landing page of your site is titled `index.html`. If this isn't the case, rename your landing page to this before continuing - otherwise Tribune won't run.
1. [Download](/download) the latest version of Tribune for your operating system.
2. Unzip the Tribune executable (`tribune` for MacOS and Linux, `tribune.exe` for Windows) and **place it in the root folder of your site.**
3. Double-click the Tribune executable and it should start running! **Make sure to read the built-in instructions that follow carefully before pressing Enter to continue.**
4. After you press enter, it'll open up a preview of your site in your default browser!
# Features
## Widgets
Tribune allows you to build widgets - reusable pieces of html that you can place throughout your site like any other element.

1. To create a widget, make an new html file in your site's "/widgets" folder. (Tribune should have created this for you if it didn't exist yet.) Place some tags inside!
```html
<!-- example: widget-name.html -->
<p>This text is being placed by a widget!</p>
```
2. Make sure the file is titled in the format `widget-name.html`. Every widget must be two lowercase words separated by a hyphen. ([Why?](https://webcomponents.guide/learn/components/naming-your-components/))
3. Place some html within the widget. Then, when you want to use it in your site, reference it like this:
```html
<widget-name></widget-name>
```
4. The content of the widget should appear wherever you placed it on the page!
## Blogging 

<!-- TODO: finish -->
# Philosophy
## Who is Tribune for?
Tribune is for amateur web designers who want to speed up the process of writing, managing, and publishing content on their personal sites *without* sacrificing the creative control over their site's design, layout, and scripts.

One thing that I've noticed browsing Neocities is that while people like having direct control over their site as a form of creative expression, most folks on Neocities are not professional-level programmers. This means that there's a great deal of friction between "having a cool idea you want to share with folks" and "actually publishing that idea in a consistent and convenient way." It doesn't take a while browsing Neocities before finding someone who has a status update along the lines of this:

> "Sorry I haven't updated in so long! I haven't had the motivation to post recently because editing this site is such a huge pain in the ass!

By default, raw HTML / CSS / JS are pretty terrible at making layouts that are modular, composable, or reusable. Professional web developers have an extremely wide array of tools to solve those problems, but we often forget that setting up those toolchains can be extremely intimidating for those less experienced with programming. There are a ton of pitfalls for total amateurs that we often forget about:
1. Most modern computer users have *never* used the command line on their system even once. If they have ever seen it done, they regard it as a strange and alienating kind of techno-wizardry.
2. Many web dev tools have a sort of implicit "Unix-chauvinism" (translation: they're designed primarily MacOS and Linux users), and many casual computer users are on Windows. Again, it's no problem for professional developers to configure things for Windows specifically, or even use tools like the [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), but casual computer users are not going to have the confidence or knowledge to do this. Have you ever tried to teach a bunch of newbies how to get NPM installed on Windows? I have. It's not easy.
3. In the process of configuring your average web dev project with a modern framework, it's very normal to be juggling up to six or seven different languages: Javascript, Typescript, Sass, TOML, YAML, JSON, Markdown, or some other ungodly combination of the bunch. There is a desperate need for zero-configuration amateur tools that work out of the box without needing to install a thousand different dependencies and CLIs.

And, so, I present what is hopefully a solution for that niche of people who are experienced enough to write basic web markup but aren't ready to tackle a proper professional-grade framework: Tribune.

## Who is Tribune *not* for?
1. **Professional web developers.** If you do this as a job, or even if you're an advanced-level hobbyist, your normal tool chain is going to be far superior to any version of Tribune that will ever exist. If you're looking for a new framework, I can heartily recommend [Astro](https://astro.build/) - I use it for every project I can (except this site, which I obviously use Tribune for instead).
2. **Complete HTML/CSS newbies.** You're at least going to want a decent understanding of the absolute basics of HTML/CSS. Luckily, Neocities has [a great tutorial](https://neocities.org/tutorial/html/1) for this purpose exactly. 
3. **People already using workflows that have complex build steps.** Tribune pretty much assumes it's the only thing in your site folder building and transforming files. If you're trying to compile Typescript, Sass, or some other intermediate language, you're probably better off going with a proper web framework.