---
date:   2017-05-28
title: "Running Damaged"
categories: 
    - Tutorials
excerpt: FreeBSD Damaged.
tags: 
    - FreeBSD
    - MountRoot
    - Fstab
---

{% include toc %}

# Overview

FreeBSD did not load after you tweaked something? Here's how to fix it.

## Fix mountroot

Sometimes we do some modification that breaks the system boot. The mountroot error is some problem to mount the disk, 
usually something that has been changed in *fstab* or *loader.conf*.

## 1. The error in the system

![Image1]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-05-28/1.png)
{: .align-center}

To solve the problem it is necessary to use a FreeBSD boot image and generate a CD or 
[USB flash drive to boot](https://www.freebsd.org/doc/en_US.ISO8859-1/books/handbook/bsdinstall-pre.html#bsdinstall-installation-media-memory-stick).
Now, download the image and create the bootable disk:

{%highlight bash%}
fetch ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-bootonly.iso
OR
wget ftp://ftp.freebsd.org/pub/FreeBSD/releases/ISO-IMAGES/11.0/FreeBSD-11.0-RELEASE-amd64-bootonly.iso
{%endhighlight%}

Boot with the image and then choose the **Shell** option in the dialog. It is necessary to know which disk partition you have to mount 
so you can use the command **sade** and then run the command below changing to your disk.

{%highlight bash%}
mount /dev/ada0s1 /mnt
{%endhighlight%}

Check your fstab for what is wrong and then reboot.

For more details check: [Handbook](https://www.freebsd.org/doc/handbook/).

