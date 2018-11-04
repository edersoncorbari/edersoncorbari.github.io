---
date:   2017-08-12
title: "Using object critical section."
categories: 
    - Tutorials
excerpt: C++ using (mutex) critical section in your application.
tags: 
    - C++
    - Mutex
    - Windows
    - Boost
    - CriticalSection
    - Thread
---

{% include toc %}

# Overview

When we are working on a multi-threaded system sharing sometimes we need to block certain part of the code to ensure that only a single process calls this object, 
so in order to ensure that we need to create a critical section.

I have already worked with this, using the [boost mutex](http://www.boost.org/doc/libs/1_58_0/doc/html/thread/synchronization.html), but for Windows platform there 
are [critical section objects](https://msdn.microsoft.com/pt-br/library/windows/desktop/ms682530(v=vs.85).aspx) that work very well. The critical sections of the 
windows System are slightly faster and provide the ability to know if a section has already been abandoned or not.

Below I show two examples using the "criticals sections" of windows and another using the mutex boost to protect the object.

## Example 1 (Windows System)

It is very simple to create a critical section using Windows see the example:

{%highlight cpp%}
#pragma once
#ifndef LOCK_HPP
#define LOCK_HPP

#include <windows.h>

class Lock
{
public:
    Lock()
    {
        InitializeCriticalSection(&this->m_critical);
    }

    ~Lock()
    {
        DeleteCriticalSection(&this->m_critical);
    }

    void enter()
    {
        EnterCriticalSection(&this->m_critical);
    }

    void leave()
    {
        LeaveCriticalSection(&this->m_critical);
    }

private:
    Lock(const Lock&);

protected:
    mutable CRITICAL_SECTION m_critical;
};

#endif // LOCK_HPP
{%endhighlight%}

Now, let's use our critical section class:

{%highlight cpp%}

#include "lock.hpp"

#include <iostream>

int main(void)
{
    Lock lock;

    std::cout << "Start: This section is not locked." << std::endl;

    lock.enter();

    // This section is locked.
    for (int i = 0; i < 100; i++)
        std::cout << "Protected section..." << std::endl;
    
    lock.leave();

    std::cout << "End: This section is not locked." << std::endl;

    return 0;
}
{%endhighlight%}

When we enter the protected section **lock.enter()** only the process in question will be executed, we need to call the **lock.leave** to release the section 
to another access process.

## Example 2 (Boost cross-platform)

Now let's make the example using boost mutex, it's also possible to do with **std** or using **Qt**. The advantage of using **boost** is that we leave our code on a 
cross-platform basis, that is, having Windows as well as Linux or other systems will work the same way, we lose some performance maybe, more is the cost of portability.

It is very simple to create a critical section using Boost see the example:

{%highlight cpp%}
#pragma once
#ifndef LOCK_HPP
#define LOCK_HPP

#include <boost/thread/mutex.hpp>
#include <boost/thread/locks.hpp>

class Lock
{
public:
    void enter()
    {
        boost::lock_guard<boost::recursive_mutex> lock(this->m_critical);
    }

    void leave()
    {
        this->m_critical.unlock();
    }

protected:
    mutable boost::recursive_mutex m_critical;
};

#endif // LOCK_HPP
{%endhighlight%}

Now, let's use our critical section class:

{%highlight cpp%}

#include "lock.hpp"

#include <iostream>

int main(void)
{
    Lock lock;

    std::cout << "Start: This section is not locked." << std::endl;

    lock.enter();

    // This section is locked.
    for (int i = 0; i < 100; i++)
        std::cout << "Protected section..." << std::endl;
    
    lock.leave();

    std::cout << "End: This section is not locked." << std::endl;

    return 0;
}
{%endhighlight%}

This is the end, the above examples were made head and not tested in the compiler, but it seems to me correct, to know more 
check the links:

* [Windows Critical Section](https://msdn.microsoft.com/pt-br/library/windows/desktop/ms682530(v=vs.85).aspx)
* [Boost Mutex](http://www.boost.org/doc/libs/1_58_0/doc/html/thread/synchronization.html)

