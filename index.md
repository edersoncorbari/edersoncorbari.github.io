---
layout: splash
permalink: /
header:
  overlay_image: /assets/images/home-page.jpg
  caption:
excerpt: 'Professional blog containing tutorials on software development and systems administration.'
feature_row:
  - image_path: /assets/images/home-tutorials.jpg
    title: "Coding tutorials"
    excerpt: "Tool installation, libraries usage hacks, computer graphics and more."
    url: "/tutorials/"
    btn_label: "View List"
  - image_path: /assets/images/home-projects.jpg
    title: "Projects"
    excerpt: "Overview of past and current projects."
    url: "/portfolio/"
    btn_label: "View List"
  - image_path: /assets/images/home-resources.jpg
    title: "Resources"
    excerpt: "Compilation of favorite books and media resources."
    url: "/resources/"
    btn_label: "View List"
intro:
  - excerpt: 'Get notified when I add new post &nbsp; [<i class="fa fa-rss"></i>RSS](feed.xml){: .btn .btn--rss}'
---

{% include feature_row id="intro" type="center" %}
{% include feature_row id="feature_row" %}
