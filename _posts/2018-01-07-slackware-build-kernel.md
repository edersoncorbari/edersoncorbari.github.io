---
date:   2018-01-07
title: "Compiling the kernel in Slackware 14.2"
categories: 
    - Tutorials
excerpt: How to compile the Linux Slackware 14.2 kernel in just three steps.
tags: 
    - Linux 
    - Slackware
    - Kernel
    - Build 
---

{% include toc %}

# Overview

My favorite Linux distro is [Slackware](http://www.slackware.com), because I find it simple and functional, so when I'm not using [FreeBSD](https://www.freebsd.org) I like to use Slackware.

Below I will describe in a few steps how easy and simple it is to compile the kernel in Slackware.

## 1. Kernel Download

* Check the latest kernel version available at [https://www.kernel.org](https://www.kernel.org).

The version I used to make this document is <strong>Linux-4.14.12</strong>.

Now run the commands below:

{%highlight bash%}
su - root
cd /usr/src
wget https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.14.12.tar.xz
tar -xvpf linux-4.14.12.tar.xz
{%endhighlight%}

## 2. Build Kernel

Let's now copy the configuration file and compile the kernel.

{%highlight bash%}
cd linux-4.14.12
zcat /proc/config.gz > .config
make olddefconfig
{%endhighlight%}

In this step you can make your modifications to the kernel, there are several possible configurations, so if you are not sure what you are doing do not modify anything and skip this step.

{%highlight bash%}
make menuconfig
{%endhighlight%}

Let's now generate the kernel image that will be used to boot the system. Set the <strong>-jN</strong> option to the core number of your processor.

{%highlight bash%}
make -j4 bzImage
{%endhighlight%}

The next step is to generate the modules and install them.

{%highlight bash%}
make -j4 modules && make modules_install
{%endhighlight%}

You can check the modules here:

{%highlight bash%}
ls /lib/modules/4.14.12
{%endhighlight%}

## 3. Making the final settings 

With the compiled kernel now we must copy the generated bzImage to the system boot directory and adjust the entries for boot, in my case I am using UEFI with Elilo.

{%highlight bash%}
cp arch/x86/boot/bzImage /boot/vmlinuz-generic-4.14.12
cp System.map /boot/System.map-generic-4.14.12
cp .config /boot/config-generic-4.14.12
{%endhighlight%}

Creating the symbolic links in the boot directory.

{%highlight bash%}
cd /boot
rm System.map
rm config
ln -s System.map-generic-4.14.12 System.map
ln -s config-generic-4.14.12 config
{%endhighlight%}

We now have to create a ramdisk images used for preloading modules in the boot system. <strong>Attention</strong> 
here because the settings may be different and you should check and adjust.

{%highlight bash%}
/usr/share/mkinitrd/mkinitrd_command_generator.sh -k 4.14.12
{%endhighlight%}

This command will generate an output similar to this:

{%highlight bash%}
mkinitrd -c -k 4.14.14 -f ext4 -r /dev/sda3 -m xhci-pci:ohci-pci:ehci-pci:xhci-hcd:uhci-hcd:ehci-hcd:hid:usbhid:
i2c-hid:hid_generic:hid-cherry:hid-logitech:hid-logitech-dj:hid-logitech-hidpp:hid-lenovo:hid-microsoft:hid_multitouch:
ext4 -u -o /boot/initrd.gz
{%endhighlight%}

You can make it cleaner by taking away things you do not think are necessary.

{%highlight bash%}
mkinitrd -c -k 4.14.12 -f ext4 -r /dev/sda3 -m ext4 -u -o /boot/initrd.gz
{%endhighlight%}

Now let's copy the images to the UEFI boot and add the entry to the <strong>elilo.conf</strong> file.

{%highlight bash%}
cd /boot/efi/EFI/Slackware/
cp -rf /boot/vmlinuz-generic-4.14.12 .
cp -rf /boot/initrd.gz .
vi elilo.conf 
{%endhighlight%}

Let the <strong>elilo.conf</strong> file look like this just by adjusting to your settings.

{%highlight bash%}
default=4.14.12
prompt
chooser=simple
delay=100
timeout=100

image=vmlinuz
        label=vmlinuz
        read-only
        append="root=/dev/sda3 vga=normal ro"

image=vmlinuz-generic-4.14.12
        label=4.14.12
        initrd=initrd.gz
        read-only
        append="root=/dev/sda3 vga=normal ro"
{%endhighlight%}

Well that's it, now just reboot the system and try out your new kernel, if you want to boot into the old kernel press the <strong>TAB</strong> key when you show the elilo boot.

For more information please check the official slackware document: [https://docs.slackware.com/howtos:slackware_admin:kernelbuilding](https://docs.slackware.com/howtos:slackware_admin:kernelbuilding)

