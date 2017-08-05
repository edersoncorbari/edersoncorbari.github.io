---
date:   2017-07-23
title: "A simple two-way socket in C++ and Qt."
categories: 
    - Tutorials
excerpt: Developing a simple two-way socket using C++ and Qt.
tags: 
    - C++
    - Qt
    - CMake
    - CLang
    - Gcc
    - Socket
    - Bidirectional
    - Thread
---

{% include toc %}

# Overview

I recently had to develop a socket server at work, I had some solutions ready using the [Boost](http://www.boost.org/) I had done in the past, more due to the complexity and having to update 
the Boost because the code was old, I preferred to use the [Qt](https://www.qt.io/) purely. I started looking at the Qt socket examples, and saw the [Fortune](http://doc.qt.io/qt-5/qtnetwork-fortuneserver-example.html) 
client and server. So I started to create from them.

# Scenario

I create a project lib that can be used and seen here: [Socket-Two-Way](https://github.com/edersoncorbari/socket-two-way).

In my scenario I had create a socket would run under Windows operating system, where I would have clients using Android or other desktop computers.
And all these clients are sending and receiving commands.

## 1. Structure of the socket

I've put the socket structure in a way that you can adapt to your personal use in case you need a question and answer socket. Basically you have to create a class of adapter 
commands your need which may be be to manipulate JSON, XML files or save to some database and then return the data to the client.

To do this simply change the file: *socket-two-way/tcpthread.cxx*. When the socket receives a new request it calls method *onReadSocket()*
This type slot method is called by a signal when the connection is processed, so to create a new command is here that you have to change:

{%highlight cpp%}
void TcpThread::onReadSocket()
{
    // Here is a command!!!                                                                                                                                                                                
    if (data == QByteArray(server::command::MY_COMMAND_XX)) {
        this->m_selfData.packageTransfer = "HELLO";
    }
} 
{%endhighlight%}

I had no need to encrypt the data that was transiting, but you can change it using the [QSslSocket](http://doc.qt.io/qt-5/qsslsocket.html) class if your data is stealthy.

Regarding performance, it's still not a problem for me, but I'm doing tests, and in another moment I comment on that in a new post. It is easy to change and adapt.

Programs that were used:

* [Qt](https://www.qt.io/)
* [CMake](https://cmake.org/)
* [CLang](https://clang.llvm.org/)
* [GCC](https://gcc.gnu.org/)

