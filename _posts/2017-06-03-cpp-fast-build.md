---
date:   2017-06-03
title: "C++ Fast Build"
categories: 
    - Tutorials
excerpt: Improving compilation performance in C++.
tags: 
    - C++
    - Ninja
    - CMake
    - CLang
    - Gcc
---

{% include toc %}

# Overview

Improving compilation performance in C++.

# My project is slow to build

Often we develop our projects without worrying about standards or optimization issues, ehen the project is small this is 
not a problem, but if the project is growing we start to have compile time problem.

So what can we do to improve the project build time. Below some of the most critical points:

* 1. Get a faster computer (of course);
* 2. Only if needed: Forward Declarations;
* 3. Add guard conditions;
* 4. Split the build into pieces;
* 5. Use parallelism and precompiled headers;
* 6. Use shared libraries.

This has to do with the physical structure of C++ and how the compiler works, this is very important in large projects.
I will detail each point quoted and then we will test with a project.

## 1. Get a faster computer

This is quite obvious, a software developer primarily working with desktop application needs to have great hardware.
If you do not have one, buy one.

## 2. Only if needed: Forward Declarations

In C++, when anything in a header file changes, all code that includes that header either directly or indirectly 
must be recompiled. So it is important to minimize these dependencies. How?


* Do not include **"#include xxx.h"** unnecessarily in the header class;
* Avoid unnecessary membership.

See the example below in the unnecessary class:

{%highlight cpp%}
...
#include <iostream>  // !!! Remove is not used !!!
#include <ostream>   // !!! Remove is not used !!!
#include <vector> 
#include <algorithm> // !!! Remove is not used !!!

class Base
{
    std::vector<int> printVector()
    {
        std::vector<int> v{1, 2, 3, 10, 25, 26, 3};
        return v;
    }
};
...
{%endhighlight%}

## 3. Add guard conditions

It is very important to add the guards to the files and also add [#pragma once](https://en.wikipedia.org/wiki/Pragma_once) to 
avoid recompiling to that file. See the class file definition example:

{%highlight cpp%}
#pragma once
#ifndef PROJECT_BASE_HXX
#define PROJECT_BASE_HXX

#include <vector> 

class Base
{
    // Constructor.
    Base();

    // Destructor.
    ~Base();

    // Print my vector.
    std::vector<int> printVector();
};

#endif // PROJECT_BASE_HXX
{%endhighlight%}

See the class implementation example:

{%highlight cpp%}
#ifndef PROJECT_BASE_HXX
#include "base.hxx" 
#define PROJECT_BASE_HXX

#include <iostream>

Base::Base()
{
    std::cout << "Constructor" << std::endl; 
}

Base::~Base()
{
    std::cout << "Destructor" << std::endl; 
}

std::vector<int> Base::printVector()
{
    std::vector<int> v{1, 2, 3, 10, 25, 26, 3};
    return v;
}
{%endhighlight%}

## 4. Split the build into pieces

Split the build into pieces, create libraries that can be reused and shared with other projects.
For example, create a library of generic methods, a library that communicates with the database, 
another library that sends data, and receives data from a server.

See the solution diagram below:

![Image1]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2017-06-03/project.png)
{: .align-center}

## 5. Use parallelism and precompiled headers

In the case of Unix environment we use the command **make** (maintain program dependencies) to build 
the project, by default make does not use parallelism, so we have to enable it. To know how many cores my 
processor uses the **lscpu** command in FreeBSD use **sysctl hw.model hw.machine hw.ncpu**, in my 
case I have 4.

So to build my project I will use the command **make -j4**. There are other build system like **ninja** or **bjam**, 
I like to use ninja with **cmake** for small and medium projects. 

## Use shared libraries

Use whenever possible shared library on Unix/Linux systems are the .so files on windows .dll and on Mac .dylib.
Shared libraries reduce the amount of code that is duplicated in each program that makes use of the library, 
keeping the binaries small. It also allows you to replace the shared object with one that is functionally equivalent, 
but may have added performance benefits without needing to recompile the program that makes use of it. Shared libraries will, 
however have a small additional cost for the execution of the functions as well as a run-time loading cost as all the 
symbols in the library need to be connected to the things they use. Additionally, shared libraries can be loaded into 
an application at run-time, which is the general mechanism for implementing binary plug-in systems.

## Testing

I made the modifications I mentioned above in a library that I use for generic methods and the speed gain for compiling 
was 20/30% for fast. Lets test:

Install clang and ccache, cmake and ninja on your system. Now do the commands below:

{%highlight bash%}
mkdir ~/test && cd ~/test
git clone https://github.com/edersoncorbari/genesis.git
cd genesis

export CC="ccache clang"
export CXX="ccache clang++"

mkdir build && cd build
cmake -GNinja ../
ninja
{%endhighlight%}

The **ninja** enables by default the parallelism in the case of **make** you need to pass **-j** with number of cores 
of your processor.

{%highlight bash%}
mkdir build && cd build
cmake ../
make -j4
{%endhighlight%}

Let's calculate the build time:

{%highlight bash%}
cd genesis
rm -rf build

mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug -GNinja ../
date +"%T" >> elapsed.log && ninja -v && date +"%T" >> elapsed.log
{%endhighlight%}

Check the file on my test:

{%highlight bash%}
cat elapsed.log

14:23:54
14:24:12
{%endhighlight%}

It takes 18 seconds to compile! It is! With some care you make your build faster and improve 
your productivity.

Programs that were used:

* [CMake](https://cmake.org/)
* [Ninja](https://ninja-build.org/)
* [CLang](https://clang.llvm.org/)
* [GCC](https://gcc.gnu.org/)

Book recommendation:

* [Large-Scale C++ Software Design](https://www.amazon.com/exec/obidos/ASIN/0201633620/ref=nosim/gamesfromwith-20)

