---
date:   2017-05-27
title: "FreeBSD Performance Tunning"
categories:
    - Tutorials
excerpt: Improving performance on FreeBSD.
tags:
    - FreeBSD
    - Tunning
---

{% include toc %}

# Overview

Improving performance on FreeBSD.

# Making adjustments

I usually make small optimizations on FreeBSD, even using it as a desktop. I like to modify the network 
part and recompile the kernel with the options I'm going to use. Basically copy and put the configuration files below. 
Getting stuck to your network NIC which may be  of another model.

## 1. Modifying the /boot/loader.conf

The FreeBSD (loader.conf) file is called at the boot of the system. The default file is in (/boot/defaults/loader.conf)
but we should not change this file, customization should be done in (/boot/loader.conf).

Copy and paste the below file:

{%highlight cmake%}
# File: /boot/loader.conf

# Reduce boot-time delay.
autoboot_delay="-1"

# Disable beastie logo.
beastie_disable="YES"

# Intel(R) PRO/1000 Gigabit Ethernet adapter driver, preload.
if_em_load="YES"

# Advanced Host Controller Interface (AHCI).
ahci_load="YES"

# H-TCP Congestion Control for a more aggressive increase in speed on higher
# latency, high bandwidth networks with some packet loss.
cc_htcp_load="YES"

# hostcache cachelimit is the number of ip addresses in the hostcache list.
# Setting the value to zero(0) stops any ip address connection information from
# being cached and negates the need for "net.inet.tcp.hostcache.expire". We
# find disabling the hostcache increases burst data rates by 2x if a subnet was
# incorrectly graded as slow on a previous connection. A host cache entry is
# the client's cached tcp connection details and metrics (TTL, SSTRESH and
# VARTTL) the server can use to improve future performance of connections
# between the same two hosts. When a tcp connection is completed, our server
# will cache information about the connection until an expire timeout. If a new
# connection between the same client is initiated before the cache has expired,
# the connection will use the cached connection details to setup the
# connection's internal variables. This pre-cached setup allows the client and
# server to reach optimal performance significantly faster because the server
# will not need to go through the usual steps of re-learning the optimal
# parameters for the connection. To view the current host cache stats use
# "sysctl net.inet.tcp.hostcache.list"
net.inet.tcp.hostcache.cachelimit="0"

# Change the zfs pool output to show the GPT id for each drive instead of the
# gptid or disk identifier. The gpt id will look like "ada0p2"; the gpt id
# "ada0" of the first drive found on the AHCI SATA / SAS / SCSI chain and
# partition string "p2".  Use "gpart list" to see all drive identifiers and
# "zpool status" to see the chosen id through ZFS.
kern.geom.label.disk_ident.enable="0"
kern.geom.label.gpt.enable="1"
kern.geom.label.gptid.enable="0"

# Interface Maximum Queue Length: common recommendations are to set the interface
# buffer size to the number of packets the interface can transmit (send) in 50
# milliseconds _OR_ 256 packets times the number of interfaces in the machine;
# whichever value is greater. To calculate a size of a 50 millisecond buffer
# for a 60 megabit network take the bandwidth in megabits divided by 8 bits
# divided by the MTU times 50 millisecond times 1000, 60/8/1460*50*1000=256.84
# packets in 50 milliseconds. OR, if the box has two(2) interfaces take 256
# packets times two(2) NICs to equal 512 packets. 512 is greater then 256.84 so
# set to 512.
#
# Our preference is to define the interface queue length as two(2) times the
# value set in the interface transmit descriptor ring, "hw.igb.txd". If
# hw.igb.txd="1024" then set the net.link.ifqmaxlen="2048".
#
# An indirect result of increasing the interface queue is the buffer acts like
# a large TCP initial congestion window (init_cwnd) by allowing a network stack
# to burst packets at the start of a connection. Do not to set to zero(0) or
# the network will stop working due to "no network buffers" available. Do not
# set the interface buffer ludicrously large to avoid buffer bloat.
net.link.ifqmaxlen="2048"  # (default 50)

# Enable the optimized version of soreceive() for stream (TCP) sockets.
# soreceive_stream() only does one sockbuf unlock/lock per receive independent
# of the length of data to be moved into the uio compared to soreceive() which
# unlocks/locks per *mbuf*. soreceive_stream() can significantly reduced CPU
# usage and lock contention when receiving fast TCP streams. Additional gains
# are obtained when the receiving application is using SO_RCVLOWAT to batch up
# some data before a read (and wakeup) is done.
net.inet.tcp.soreceive_stream="1"  # (default 0)
{%endhighlight%}

## 2. Modifying the /etc/rc.conf

The rc.conf file contains the FreeBSD network startup and services configuration. Make the 
(/etc/rc.conf) modifications.

{%highlight cmake%}
# RC.conf - System configuration information.

# Machine name.
hostname="orion"

# Network.
ifconfig_em0="DHCP -lro -tso"

# Enable ZFS filesystem.
zfs_enable="YES"

# Disable update motd.
update_motd="NO"

# Clear /tmp on boot.
clear_tmp_enable="YES"

# Allow packets to pass between interfaces.
gateway_enable="YES"

# Keboard delay to 250 ms and repeat to 34 cps.
keyrate="250.34"

# Daemons disabled.
dumpdev="NO"
sendmail_enable="NONE"

# Daemons enabled.
#ntpdate_enable="YES"
#ntpdate_hosts="c.ntp.br"
#ntpd_flags="-g"
sshd_enable="YES"
syslogd_flags="-ss"
{%endhighlight%}

## 3. Modifying the /etc/sysctl.conf

The (sysctl.conf) file contains policy customizations for the kernel.

{%highlight cmake%}
# Firewall: Ip Forwarding to allow packets to traverse between interfaces and
# is used for firewalls, bridges and routers. When fast IP forwarding is also
# enabled, IP packets are forwarded directly to the appropriate network
# interface with direct processing to completion, which greatly improves the
# throughput. All packets for local IP addresses, non-unicast, or with IP
# options are handled by the normal IP input processing path. All features of
# the normal (slow) IP forwarding path are supported by fast forwarding
# including firewall (through pfil(9) hooks) checking, except ipsec tunnel
# brokering. The IP fast forwarding path does not generate ICMP redirect or
# source quench messages though. Compared to normal IP forwarding, fast
# forwarding can give a speedup of 40 to 60% in packet forwarding performance
# which is great for interactive connections like online games or VOIP where
# low latency is critical.
net.inet.ip.forwarding=1                   # (default 0)

# H-TCP congestion control: The Hamilton TCP (HighSpeed-TCP) algorithm is a
# packet loss based congestion control and is more aggressive pushing up to max
# bandwidth (total BDP) and favors hosts with lower TTL / VARTTL then the
# default "newreno". Understand "newreno" works well in most conditions and
# enabling HTCP may only gain a you few percentage points of throughput.
# http://www.sigcomm.org/sites/default/files/ccr/papers/2008/July/1384609-1384613.pdf
# make sure to also add 'cc_htcp_load="YES"' to /boot/loader.conf then check
# available congestion control options with "sysctl net.inet.tcp.cc.available"
net.inet.tcp.cc.algorithm=htcp  # (default newreno)

# H-TCP congestion control: adaptive back off will increase bandwidth
# utilization by adjusting the additive-increase/multiplicative-decrease (AIMD)
# backoff parameter according to the amount of buffers available on the path.
# adaptive backoff ensures no queue along the path will remain completely empty
# after a packet loss event which increases buffer efficiency.
net.inet.tcp.cc.htcp.adaptive_backoff=1  # (default 0 ; disabled)

# H-TCP congestion control: RTT scaling will increase the fairness between
# competing TCP flows traversing different RTT paths through a common
# bottleneck. rtt_scaling increases the Congestion Window Size (CWND)
# independent of path round-trip time (RTT) leading to lower latency for
# interactive sessions when the connection is saturated by bulk data transfers.
# Default is 0 (disabled)
net.inet.tcp.cc.htcp.rtt_scaling=1  # (default 0 ; disabled)

# RFC 6675 increases the accuracy of TCP Fast Recovery when combined with
# Selective Acknowledgement (net.inet.tcp.sack.enable=1). TCP loss recovery is
# enhanced by computing "pipe", a sender side estimation of the number of bytes
# still outstanding on the network. Fast Recovery is augmented by sending data
# on each ACK as necessary to prevent "pipe" from falling below the slow-start
# threshold (ssthresh). The TCP window size and SACK-based decisions are still
# determined by the congestion control algorithm; H-TCP if enabled, newreno by
# default.
net.inet.tcp.rfc6675_pipe=1  # (default 0)

# maximum segment size (MSS) specifies the largest payload of data in a single
# IPv4 TCP segment. RFC 6691 states the maximum segment size should equal the
# effective MTU minus the fixed IP and TCP headers, but without subtracting IP
# or TCP options. To construct the MMS, start with the interface MTU of 1500
# bytes and subtract 20 bytes for the IP header and 20 bytes for the TCP header
# to equal 1460 bytes. An MMS of 1460 bytes has a 97% packet efficiency
# (1460/1500=0.97) Note: with net.inet.tcp.rfc1323 enabled, hosts can negotiate
# the tcp timestamps option which reduces the packet payload by 12 bytes and
# the MSS is automatically reduced from 1460 bytes to 1448 bytes total. An MMS
# of 1448 bytes has a 96.5% packet efficiency (1448/1500=0.965) WARNING: if you
# are using PF with an outgoing scrub rule then PF will re-package the packet
# using an MTU of 1460 by default, thus overriding this mssdflt setting and
# possibly wasting CPU time.
net.inet.tcp.mssdflt=1460  # (default 536)

# minimum, maximum segment size (mMSS) specifies the smallest payload of data
# in a single IPv4 TCP segment our system will agree to send when negotiating
# with the client. RFC 6691 states that a minimum MTU frame size of 576 bytes
# must be supported and the MSS option should equal the effective MTU minus the
# fixed IP and TCP headers, but without subtracting IP or TCP options. To
# construct the minimum MMS, start with the minimum recommended MTU size of 576
# bytes and subtract 20 bytes for the IP header and 20 bytes for the TCP header
# to equal 536 bytes. An mMMS of 536 bytes should allow our server to forward
# data across any network without being fragmented and still preserve an
# overhead to data ratio of 93% packet efficiency (536/576=0.93). The default
# mMMS is only 84% efficient (216/256=0.84).
net.inet.tcp.minmss=536  # (default 216)

# Reduce the amount of SYN/ACKs the server will re-transmit to an ip address
# whom did not respond to the first SYN/ACK. On a client's initial connection
# our server will always send a SYN/ACK in response to the client's initial
# SYN. Limiting retranstited SYN/ACKS reduces local syn cache size and a "SYN
# flood" DoS attack's collateral damage by not sending SYN/ACKs back to spoofed
# ips, multiple times. If we do continue to send SYN/ACKs to spoofed IPs they
# may send RST's back to us and an "amplification" attack would begin against
# our host. If you do not wish to send retransmits at all then set to zero(0)
# especially if you are under a SYN attack. If our first SYN/ACK gets dropped
# the client will re-send another SYN if they still want to connect. Also set
# "net.inet.tcp.msl" to two(2) times the average round trip time of a client,
# but no lower then 2000ms (2s). Test with "netstat -s -p tcp" and look under
# syncache entries. http://www.ouah.org/spank.txt
# http://people.freebsd.org/~jlemon/papers/syncache.pdf
net.inet.tcp.syncache.rexmtlimit=0  # (default 3)

# IP fragments require CPU processing time and system memory to reassemble. Due
# to multiple attacks vectors ip fragmentation can contribute to and that
# fragmentation can be used to evade packet inspection and auditing, we will
# not accept ipv4 fragments. Comment out these directives when supporting
# traffic which generates fragments by design; like NFS and certain
# preternatural functions of the Sony PS4.
# https://en.wikipedia.org/wiki/IP_fragmentation_attack
net.inet.ip.maxfragpackets=0     # (default 13687)
net.inet.ip.maxfragsperpacket=0  # (default 16)

# TCP Slow start gradually increases the data send rate until the TCP
# congestion algorithm (HTCP) calculates the networks maximum carrying capacity
# without dropping packets. TCP Congestion Control with Appropriate Byte
# Counting (ABC) allows our server to increase the maximum congestion window
# exponentially by the amount of data ACKed, but limits the maximum increment
# per ACK to (abc_l_var * maxseg) bytes. An abc_l_var of 44 times a maxseg of
# 1460 bytes would allow slow start to increase the congestion window by more
# than 64 kilobytes per step; 65535 bytes is the TCP receive buffer size of
# most hosts without TCP window scaling.
net.inet.tcp.abc_l_var=44  # (default 2)

# Initial Congestion Window (initcwnd) limits the amount of segments that TCP
# can send onto the network before receiving an ACK from the other machine.
# Increasing the TCP Initial Congestion Window will reduce data transfer
# latency during the slow start phase of a TCP connection. The initial
# congestion window should be increased to speed up short, burst connections
# in order to send the most data in the shortest time frame without overloading
# any network buffers. Google's study reported sixteen(16) segments as showing
# the lowest latency initial congestion window. Also test 44 segments which is
# 65535 bytes, the TCP receive buffer size of most hosts without TCP window
# scaling. https://developers.google.com/speed/articles/tcp_initcwnd_paper.pdf
net.inet.tcp.initcwnd_segments=44             # (default 10 for FreeBSD 11.0)
#net.inet.tcp.experimental.initcwnd10=1       # (default  1 for FreeBSD 10.1)
#net.inet.tcp.experimental.initcwnd10=1       # (default  0 for FreeBSD  9.2)
#net.inet.tcp.local_slowstart_flightsize=44   # (default  4 for FreeBSD  9.1)
#net.inet.tcp.slowstart_flightsize=44         # (default  4 for FreeBSD  9.1)

# TCP Receive Window: The throughput of connection is limited by two windows: the
# (Initial) Congestion Window and the TCP Receive Window (wsize). The Congestion
# Window avoids exceeding the capacity of the network (H-TCP congestion
# control); and the Receive Window avoids exceeding the capacity of the
# receiver to process data (flow control). When our server is able to process
# packets as fast as they are received we want to allow the remote sending
# host to send data as fast as the network, Congestion Window, will allow.
# Increase the Window Scaling Factor (wsize) to fourteen(14) which allows the
# our server to receive 2^14 x 65,535 bytes = 1,064,960 bytes (100 gigabit) on
# the network before requiring an ACK packet.
#
# maxsockbuf:   2MB  wsize:  6  2^ 6*65KB =    4MB (FreeBSD default)
# maxsockbuf: 600MB  wsize: 14  2^14*65KB = 1064MB
kern.ipc.maxsockbuf=614400000  # (wsize 14)

# Syncookies have advantages and disadvantages. Syncookies are useful if you
# are being DoS attacked as this method helps filter the proper clients from
# the attack machines. But, since the TCP options from the initial SYN are not
# saved in syncookies, the tcp options are not applied to the connection,
# precluding use of features like window scale, timestamps, or exact MSS
# sizing. As the returning ACK establishes the connection, it may be possible
# for an attacker to ACK flood a machine in an attempt to create a connection.
# Another benefit to overflowing to the point of getting a valid SYN cookie is
# the attacker can include data payload. Now that the attacker can send data to
# a FreeBSD network daemon, even using a spoofed source IP address, they can
# have FreeBSD do processing on the data which is not something the attacker
# could do without having SYN cookies. Even though syncookies are helpful
# during a DoS, we are going to disable syncookies at this time.
net.inet.tcp.syncookies=0  # (default 1)

# TCP segmentation offload (TSO), also called large segment offload (LSO),
# should be disabled on NAT firewalls and routers. TSO/LSO works by queuing up
# large buffers and letting the network interface card (NIC) split them into
# separate packets. The problem is the NIC can build a packet that is the wrong
# size and would be dropped by a switch or the receiving machine, like for NFS
# fragmented traffic. If the packet is dropped the overall sending bandwidth is
# reduced significantly. You can also disable TSO in /etc/rc.conf using the
# "-tso" directive after the network card configuration; for example,
# ifconfig_igb0="inet 10.10.10.1 netmask 255.255.255.0 -tso". Verify TSO is off
# on the hardware by making sure TSO4 and TSO6 are not seen in the "options="
# section using ifconfig.
# http://www.peerwisdom.org/2013/04/03/large-send-offload-and-network-performance/
net.inet.tcp.tso=0  # (default 1)

# Fortuna pseudorandom number generator (PRNG) maximum event size is also
# referred to as the minimum pool size. Fortuna has a main generator which
# supplies the OS with PRNG data. The Fortuna generator is seeded by 32
# separate 'Fortuna' accumulation pools which each have to be filled with at
# least 'minpoolsize' bytes before being able to seed the generator. On
# FreeBSD, the default 'minpoolsize' of 64 bytes is an estimate of how many
# bytes a new pool should contain to provide at least 128 bits of entropy.
# After a pool is used in a generator reseed, it is reset to an empty string
# and must reach 'minpoolsize' bytes again before being used as a seed. By
# increasing the 'minpoolsize' we allow higher entropy into the accumulation
# pools before being assimilated by the generator. 256 bytes will provide an
# absolute minimum of 512 bits of entropy, but realistically closer to 2048
# bits of entropy, for each of the 32 accumulation pools. Values between 64
# bytes and 256 bytes are reasonable, but higher values like 1024 bytes are
# also acceptable when coupled with a dedicated hardware based PRNG like the
# fast source Intel Secure Key RNG.
kern.random.fortuna.minpoolsize=2048  # (default 64)

# Initial Sequence Numbers (ISN) refer to the unique 32-bit sequence number
# assigned to each new Transmission Control Protocol (TCP) connection. The TCP
# protocol assigns an ISN to each new byte, beginning with 0 and incrementally
# adding a secret number every four seconds until the limit is exhausted. In
# continuous communication all available ISN options could be used up in a few
# hours. Normally a new secret number is only chosen after the ISN limit has
# been exceeded. In order to defend against Sequence Number Attacks the ISN
# secret key should not be used sufficiently often that it would be regarded as
# insecure or predictable. Reseeding will break TIME_WAIT recycling for a few
# minutes. BUT, for the more paranoid, simply choose a random number of seconds
# in which a new ISN secret should be generated.
# https://tools.ietf.org/html/rfc6528
net.inet.tcp.isn_reseed_interval=4500  # (default 0, disabled)

#
# HardenedBSD and DoS mitigation
#
hw.kbd.keymap_restrict_change=4    # disallow keymap changes for non-privileged users
kern.ipc.shm_use_phys=1            # lock shared memory into RAM and prevent it from being paged out to swap (default 0, disabled)
kern.msgbuf_show_timestamp=1       # display timestamp in msgbuf (default 0)
kern.randompid=7657                # calculate PIDs by the modulus of the integer given, choose a random int (default 0)
net.inet.icmp.drop_redirect=1      # no redirected ICMP packets (default 0)
net.inet.ip.check_interface=1      # verify packet arrives on correct interface (default 0)
net.inet.ip.portrange.first=1024   # use ports 1024 to portrange.last for outgoing connections (default 10000)
net.inet.ip.portrange.randomcps=999 # use random port allocation if less than this many ports per second are allocated (default 10)
net.inet.ip.random_id=1            # assign a random IP id to each packet leaving the system (default 0)
net.inet.ip.redirect=0             # do not send IP redirects (default 1)
net.inet.sctp.blackhole=2          # drop stcp packets destined for closed ports (default 0)
net.inet.tcp.always_keepalive=0    # disable tcp keep alive detection for dead peers, keepalive can be spoofed (default 1)
net.inet.tcp.blackhole=2           # drop tcp packets destined for closed ports (default 0)
net.inet.tcp.drop_synfin=1         # SYN/FIN packets get dropped on initial connection (default 0)
net.inet.tcp.ecn.enable=0          # Explicit Congestion Notification disabled unless proper active queue management is verified (default 2)
net.inet.tcp.fast_finwait2_recycle=1 # recycle FIN/WAIT states quickly, helps against DoS, but may cause false RST (default 0)
net.inet.tcp.finwait2_timeout=5000 # TCP FIN_WAIT_2 timeout waiting for client FIN packet before state close (default 60000, 60 sec)
net.inet.tcp.icmp_may_rst=0        # icmp may not send RST to avoid spoofed icmp/udp floods (default 1)
net.inet.tcp.keepinit=5000         # establish connection in five(5) seconds or abort attempt (default 75000, 75 secs)
net.inet.tcp.msl=2500              # Maximum Segment Lifetime, time the connection spends in TIME_WAIT state (default 30000, 2*MSL = 60 sec)
net.inet.tcp.nolocaltimewait=1     # remove TIME_WAIT states for the loopback interface (default 0)
net.inet.tcp.path_mtu_discovery=0  # disable MTU discovery since many hosts drop ICMP type 3 packets (default 1)
net.inet.tcp.rexmit_slop=70        # reduce the TCP retransmit timer, min+slop=100ms (default 200ms)
net.inet.udp.blackhole=1           # drop udp packets destined for closed sockets (default 0)
security.bsd.hardlink_check_gid=1  # unprivileged processes may not create hard links to files owned by other groups (default 0)
security.bsd.hardlink_check_uid=1  # unprivileged processes may not create hard links to files owned by other users (default 0)
security.bsd.see_other_gids=0      # groups only see their own processes. root can see all (default 1)
security.bsd.see_other_uids=0      # users only see their own processes. root can see all (default 1)
security.bsd.stack_guard_page=1    # stack smashing protection (SSP), ProPolice, defence against buffer overflows (default 0)
security.bsd.unprivileged_proc_debug=0 # unprivileged processes may not use process debugging (default 1)
security.bsd.unprivileged_read_msgbuf=0 # unprivileged processes may not read the kernel message buffer (default 1)
{%endhighlight%}

## 4. Compiling the kernel

To build the kernel in FreeBSD is very simple, everything is done in a single file, however there are a number of 
possible configurations and depends on your hardware. But to build just run the commands below:

{%highlight bash%}
cp /usr/src/sys/amd64/conf/GENERIC /usr/src/sys/amd64/conf/ORION
vi /usr/src/sys/amd64/conf/ORION
{%endhighlight%}

Try checking the devices you do not use and comment or remove the line from the kernel configuration file. Below 
is my kernel file, I removed sound card, network card that I do not use for this hardware.

{%highlight cmake%}
# $FreeBSD: releng/11.0/sys/amd64/conf/GENERIC 302410 2016-07-08 00:22:14Z gjb $

cpu             HAMMER
ident           ORION

# enable Pf without ALTQ (HFSC)
device pf
device pflog
device pfsync
options ALTQ
options ALTQ_HFSC
options ALTQ_NOPCC

# forward packets without decrementing
# the time to live (TTL) counter
options IPSTEALTH

makeoptions     DEBUG=-g                # Build kernel with gdb(1) debug symbols
makeoptions     WITH_CTF=1              # Run ctfconvert(1) for DTrace support

options         SCHED_ULE               # ULE scheduler
options         PREEMPTION              # Enable kernel thread preemption
options         INET                    # InterNETworking

#options        INET6                   # IPv6 communications protocols

options         IPSEC                   # IP (v4/v6) security
options         TCP_OFFLOAD             # TCP offload
options         SCTP                    # Stream Control Transmission Protocol
options         FFS                     # Berkeley Fast Filesystem
options         SOFTUPDATES             # Enable FFS soft updates support
options         UFS_ACL                 # Support for access control lists
options         UFS_DIRHASH             # Improve performance on big directories
options         UFS_GJOURNAL            # Enable gjournal-based UFS journaling
#options        QUOTA                   # Enable disk quotas for UFS
options         MD_ROOT                 # MD is a potential root device

#options        NFSCL                   # Network Filesystem Client
#options        NFSD                    # Network Filesystem Server
#options        NFSLOCKD                # Network Lock Manager
#options        NFS_ROOT                # NFS usable as /, requires NFSCL
#options        MSDOSFS                 # MSDOS Filesystem
#options        CD9660                  # ISO 9660 Filesystem
options         PROCFS                  # Process filesystem (requires PSEUDOFS)
options         PSEUDOFS                # Pseudo-filesystem framework
options         GEOM_PART_GPT           # GUID Partition Tables.
options         GEOM_RAID               # Soft RAID functionality.
options         GEOM_LABEL              # Provides labelization
options         COMPAT_FREEBSD32        # Compatible with i386 binaries
options         COMPAT_FREEBSD4         # Compatible with FreeBSD4
options         COMPAT_FREEBSD5         # Compatible with FreeBSD5
options         COMPAT_FREEBSD6         # Compatible with FreeBSD6
options         COMPAT_FREEBSD7         # Compatible with FreeBSD7
options         COMPAT_FREEBSD9         # Compatible with FreeBSD9
options         COMPAT_FREEBSD10        # Compatible with FreeBSD10
options         SCSI_DELAY=5000         # Delay (in ms) before probing SCSI
options         KTRACE                  # ktrace(1) support
options         STACK                   # stack(9) support
options         SYSVSHM                 # SYSV-style shared memory
options         SYSVMSG                 # SYSV-style message queues
options         SYSVSEM                 # SYSV-style semaphores
options         _KPOSIX_PRIORITY_SCHEDULING # POSIX P1003_1B real-time extensions
options         PRINTF_BUFR_SIZE=128    # Prevent printf output being interspersed.
options         KBD_INSTALL_CDEV        # install a CDEV entry in /dev
options         HWPMC_HOOKS             # Necessary kernel hooks for hwpmc(4)
options         AUDIT                   # Security event auditing
options         CAPABILITY_MODE         # Capsicum capability mode
options         CAPABILITIES            # Capsicum capabilities
options         MAC                     # TrustedBSD MAC Framework
options         KDTRACE_FRAME           # Ensure frames are compiled in
options         KDTRACE_HOOKS           # Kernel DTrace hooks
options         DDB_CTF                 # Kernel ELF linker loads CTF data
options         INCLUDE_CONFIG_FILE     # Include this file in kernel
options         RACCT                   # Resource accounting framework
options         RACCT_DEFAULT_TO_DISABLED # Set kern.racct.enable=0 by default
options         RCTL                    # Resource limits

# Debugging support.  Always need this:
options         KDB                     # Enable kernel debugger support.
options         KDB_TRACE               # Print a stack trace for a panic.

# Make an SMP-capable kernel by default
options         SMP                     # Symmetric MultiProcessor Kernel
options         DEVICE_NUMA             # I/O Device Affinity

# CPU frequency control
device          cpufreq

# Bus support.
device          acpi
options         ACPI_DMAR
device          pci
options         PCI_HP                  # PCI-Express native HotPlug
options         PCI_IOV                 # PCI SR-IOV support

# Floppy drives
#device          fdc

# ATA controllers
device          ahci                    # AHCI-compatible SATA controllers
device          ata                     # Legacy ATA/SATA controllers
device          mvs                     # Marvell 88SX50XX/88SX60XX/88SX70XX/SoC SATA
device          siis                    # SiliconImage SiI3124/SiI3132/SiI3531 SATA

# SCSI Controllers
device          ahc                     # AHA2940 and onboard AIC7xxx devices
options         AHC_REG_PRETTY_PRINT    # Print register bitfields in debug
                                        # output.  Adds ~128k to driver.
device          ahd                     # AHA39320/29320 and onboard AIC79xx devices
options         AHD_REG_PRETTY_PRINT    # Print register bitfields in debug
                                        # output.  Adds ~215k to driver.
device          esp                     # AMD Am53C974 (Tekram DC-390(T))
device          hptiop                  # Highpoint RocketRaid 3xxx series
device          isp                     # Qlogic family
#device         ispfw                   # Firmware for QLogic HBAs- normally a module
device          mpt                     # LSI-Logic MPT-Fusion
device          mps                     # LSI-Logic MPT-Fusion 2
device          mpr                     # LSI-Logic MPT-Fusion 3
#device         ncr                     # NCR/Symbios Logic
device          sym                     # NCR/Symbios Logic (newer chipsets + those of `ncr')
device          trm                     # Tekram DC395U/UW/F DC315U adapters

device          adv                     # Advansys SCSI adapters
device          adw                     # Advansys wide SCSI adapters
device          aic                     # Adaptec 15[012]x SCSI adapters, AIC-6[23]60.
device          bt                      # Buslogic/Mylex MultiMaster SCSI adapters
device          isci                    # Intel C600 SAS controller

# ATA/SCSI peripherals
device          scbus                   # SCSI bus (required for ATA/SCSI)
device          ch                      # SCSI media changers
device          da                      # Direct Access (disks)
device          sa                      # Sequential Access (tape etc)
device          cd                      # CD
device          pass                    # Passthrough device (direct ATA/SCSI access)
device          ses                     # Enclosure Services (SES and SAF-TE)
#device         ctl                     # CAM Target Layer

# RAID controllers interfaced to the SCSI subsystem
device          amr                     # AMI MegaRAID
device          arcmsr                  # Areca SATA II RAID
device          ciss                    # Compaq Smart RAID 5*
device          dpt                     # DPT Smartcache III, IV - See NOTES for options
device          hptmv                   # Highpoint RocketRAID 182x
device          hptnr                   # Highpoint DC7280, R750
device          hptrr                   # Highpoint RocketRAID 17xx, 22xx, 23xx, 25xx
device          hpt27xx                 # Highpoint RocketRAID 27xx
device          iir                     # Intel Integrated RAID
device          ips                     # IBM (Adaptec) ServeRAID
device          mly                     # Mylex AcceleRAID/eXtremeRAID
device          twa                     # 3ware 9000 series PATA/SATA RAID
device          tws                     # LSI 3ware 9750 SATA+SAS 6Gb/s RAID controller

# RAID controllers
device          aac                     # Adaptec FSA RAID
device          aacp                    # SCSI passthrough for aac (requires CAM)
device          aacraid                 # Adaptec by PMC RAID
device          ida                     # Compaq Smart RAID
device          mfi                     # LSI MegaRAID SAS
device          mlx                     # Mylex DAC960 family
device          mrsas                   # LSI/Avago MegaRAID SAS/SATA, 6Gb/s and 12Gb/s
device          pmspcv                  # PMC-Sierra SAS/SATA Controller driver
#XXX pointer/int warnings
#device         pst                     # Promise Supertrak SX6000
device          twe                     # 3ware ATA RAID

# NVM Express (NVMe) support
device          nvme                    # base NVMe driver
device          nvd                     # expose NVMe namespaces as disks, depends on nvme

# atkbdc0 controls both the keyboard and the PS/2 mouse
device          atkbdc                  # AT keyboard controller
device          atkbd                   # AT keyboard
device          psm                     # PS/2 mouse

device          kbdmux                  # keyboard multiplexer

device          vga                     # VGA video card driver
options         VESA                    # Add support for VESA BIOS Extensions (VBE)

device          splash                  # Splash screen and screen saver support

# syscons is the default console driver, resembling an SCO console
device          sc
options         SC_PIXEL_MODE           # add support for the raster text mode
options         SC_PIXEL_MODE       # add support for the raster text mode
options         SC_NORM_ATTR=(FG_GREEN|BG_BLACK)
options         SC_KERNEL_CONS_ATTR=(FG_WHITE|BG_BLACK)

# vt is the new video console driver
device          vt
device          vt_vga
device          vt_efifb

device          agp                     # support several AGP chipsets

# PCCARD (PCMCIA) support
# PCMCIA and cardbus bridge support
#device         cbb                     # cardbus (yenta) bridge
#device         pccard                  # PC Card (16-bit) bus
#device         cardbus                 # CardBus (32-bit) bus

# Serial (COM) ports
#device         uart                    # Generic UART driver

# Parallel port
device          ppc
device          ppbus                   # Parallel port bus (required)
#device         lpt                     # Printer
device          ppi                     # Parallel port interface device
#device         vpo                     # Requires scbus and da

#device         puc                     # Multi I/O cards and multi-channel UARTs

# PCI Ethernet NICs.
#device         bxe                     # Broadcom NetXtreme II BCM5771X/BCM578XX 10GbE
#device         de                      # DEC/Intel DC21x4x (``Tulip'')
device          em                      # Intel PRO/1000 Gigabit Ethernet Family
#device         igb                     # Intel PRO/1000 PCIE Server Gigabit Family
#device         ix                      # Intel PRO/10GbE PCIE PF Ethernet
#device         ixv                     # Intel PRO/10GbE PCIE VF Ethernet
#device         ixl                     # Intel XL710 40Gbe PCIE Ethernet
#device         ixlv                    # Intel XL710 40Gbe VF PCIE Ethernet
#device         le                      # AMD Am7900 LANCE and Am79C9xx PCnet
#device         ti                      # Alteon Networks Tigon I/II gigabit Ethernet
#device         txp                     # 3Com 3cR990 (``Typhoon'')
#device         vx                      # 3Com 3c590, 3c595 (``Vortex'')

# PCI Ethernet NICs that use the common MII bus controller code.
# NOTE: Be sure to keep the 'device miibus' line in order to use these NICs!
#device         miibus                  # MII bus support
#device         ae                      # Attansic/Atheros L2 FastEthernet
#device         age                     # Attansic/Atheros L1 Gigabit Ethernet
#device         alc                     # Atheros AR8131/AR8132 Ethernet
#device         ale                     # Atheros AR8121/AR8113/AR8114 Ethernet
#device         bce                     # Broadcom BCM5706/BCM5708 Gigabit Ethernet
#device         bfe                     # Broadcom BCM440x 10/100 Ethernet
#device         bge                     # Broadcom BCM570xx Gigabit Ethernet
#device         cas                     # Sun Cassini/Cassini+ and NS DP83065 Saturn
#device         dc                      # DEC/Intel 21143 and various workalikes
#device         et                      # Agere ET1310 10/100/Gigabit Ethernet
#device         fxp                     # Intel EtherExpress PRO/100B (82557, 82558)
#device         gem                     # Sun GEM/Sun ERI/Apple GMAC
#device         hme                     # Sun HME (Happy Meal Ethernet)
#device         jme                     # JMicron JMC250 Gigabit/JMC260 Fast Ethernet
#device         lge                     # Level 1 LXT1001 gigabit Ethernet
#device         msk                     # Marvell/SysKonnect Yukon II Gigabit Ethernet
#device         nfe                     # nVidia nForce MCP on-board Ethernet
#device         nge                     # NatSemi DP83820 gigabit Ethernet
#device         pcn                     # AMD Am79C97x PCI 10/100 (precedence over 'le')
#device         re                      # RealTek 8139C+/8169/8169S/8110S
#device         rl                      # RealTek 8129/8139
#device         sf                      # Adaptec AIC-6915 (``Starfire'')
#device         sge                     # Silicon Integrated Systems SiS190/191
#device         sis                     # Silicon Integrated Systems SiS 900/SiS 7016
#device         sk                      # SysKonnect SK-984x & SK-982x gigabit Ethernet
#device         ste                     # Sundance ST201 (D-Link DFE-550TX)
#device         stge                    # Sundance/Tamarack TC9021 gigabit Ethernet
#device         tl                      # Texas Instruments ThunderLAN
#device         tx                      # SMC EtherPower II (83c170 ``EPIC'')
#device         vge                     # VIA VT612x gigabit Ethernet
#device         vr                      # VIA Rhine, Rhine II
#device         wb                      # Winbond W89C840F
#device         xl                      # 3Com 3c90x (``Boomerang'', ``Cyclone'')

# Wireless NIC cards
#device         wlan                    # 802.11 support
#options        IEEE80211_DEBUG         # enable debug msgs
#options        IEEE80211_AMPDU_AGE     # age frames in AMPDU reorder q's
#options        IEEE80211_SUPPORT_MESH  # enable 802.11s draft support
#device         wlan_wep                # 802.11 WEP support
#device         wlan_ccmp               # 802.11 CCMP support
#device         wlan_tkip               # 802.11 TKIP support
#device         wlan_amrr               # AMRR transmit rate control algorithm
#device         an                      # Aironet 4500/4800 802.11 wireless NICs.
#device         ath                     # Atheros NICs
#device         ath_pci                 # Atheros pci/cardbus glue
#device         ath_hal                 # pci/cardbus chip support
#options        AH_SUPPORT_AR5416       # enable AR5416 tx/rx descriptors
#options        AH_AR5416_INTERRUPT_MITIGATION # AR5416 interrupt mitigation
#options        ATH_ENABLE_11N          # Enable 802.11n support for AR5416 and later
#device         ath_rate_sample         # SampleRate tx rate control for ath
#device         bwi                     # Broadcom BCM430x/BCM431x wireless NICs.
#device         bwn                     # Broadcom BCM43xx wireless NICs.
#device         ipw                     # Intel 2100 wireless NICs.
#device         iwi                     # Intel 2200BG/2225BG/2915ABG wireless NICs.
#device         iwn                     # Intel 4965/1000/5000/6000 wireless NICs.
#device         malo                    # Marvell Libertas wireless NICs.
#device         mwl                     # Marvell 88W8363 802.11n wireless NICs.
#device         ral                     # Ralink Technology RT2500 wireless NICs.
#device         wi                      # WaveLAN/Intersil/Symbol 802.11 wireless NICs.
#device         wpi                     # Intel 3945ABG wireless NICs.

# Pseudo devices.
device          loop                    # Network loopback
device          random                  # Entropy device
device          padlock_rng             # VIA Padlock RNG
device          rdrand_rng              # Intel Bull Mountain RNG
device          ether                   # Ethernet support
device          vlan                    # 802.1Q VLAN support
device          tun                     # Packet tunnel.
device          md                      # Memory "disks"
device          gif                     # IPv6 and IPv4 tunneling
device          firmware                # firmware assist module

# The `bpf' device enables the Berkeley Packet Filter.
# Be aware of the administrative consequences of enabling this!
# Note that 'bpf' is required for DHCP.
device          bpf                     # Berkeley packet filter

# USB support
options         USB_DEBUG               # enable debug msgs
device          uhci                    # UHCI PCI->USB interface
device          ohci                    # OHCI PCI->USB interface
device          ehci                    # EHCI PCI->USB interface (USB 2.0)
device          xhci                    # XHCI PCI->USB interface (USB 3.0)
device          usb                     # USB Bus (required)
device          ukbd                    # Keyboard
device          umass                   # Disks/Mass storage - Requires scbus and da

# Sound support
#device         sound                   # Generic sound driver (required)
#device         snd_cmi                 # CMedia CMI8338/CMI8738
#device         snd_csa                 # Crystal Semiconductor CS461x/428x
#device         snd_emu10kx             # Creative SoundBlaster Live! and Audigy
#device         snd_es137x              # Ensoniq AudioPCI ES137x
#device         snd_hda                 # Intel High Definition Audio
#device         snd_ich                 # Intel, NVidia and other ICH AC'97 Audio
#device         snd_via8233             # VIA VT8233x Audio

# MMC/SD
device          mmc                     # MMC/SD bus
device          mmcsd                   # MMC/SD memory card
device          sdhci                   # Generic PCI SD Host Controller

# VirtIO support
device          virtio                  # Generic VirtIO bus (required)
device          virtio_pci              # VirtIO PCI device
device          vtnet                   # VirtIO Ethernet device
device          virtio_blk              # VirtIO Block device
device          virtio_scsi             # VirtIO SCSI device
device          virtio_balloon          # VirtIO Memory Balloon device

# HyperV drivers and enhancement support
device          hyperv                  # HyperV drivers

# Xen HVM Guest Optimizations
# NOTE: XENHVM depends on xenpci.  They must be added or removed together.
#options        XENHVM                  # Xen HVM kernel infrastructure
#device         xenpci                  # Xen HVM Hypervisor services driver

# VMware support
#device         vmx                     # VMware VMXNET3 Ethernet

# Netmap provides direct access to TX/RX rings on supported NICs
device          netmap                  # netmap(4) support

# The crypto framework is required by IPSEC
device          crypto                  # Required by IPSEC
{%endhighlight%}

To compile the kernel run the command below:

{%highlight bash%}
cd /usr/src/ 
make clean && make buildkernel KERNCONF=ORION
make installkernel KERNCONF=ORION && make clean && sync
shutdown -r now
{%endhighlight%}

For more details check the article: [Network tunning](https://calomel.org/freebsd_network_tuning.html) and 
[Building and Installing a Custom Kernel](https://www.freebsd.org/doc/handbook/kernelconfig-building.html).

