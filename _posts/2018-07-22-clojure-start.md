---
date:   2018-07-22
title: "Playing with Clojure"
categories: 
    - Tutorials
excerpt: Installing Clojure on FreeBSD and playing with the alien dialect.
tags: 
    - Clojure 
    - Lisp
    - FreeBSD
    - Linux
---

{% include toc %}

# Overview

[Clojure](https://en.wikipedia.org/wiki/Clojure) is a dialect of the [Lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language)) programming language that has long been known by the free software community, but Clojure runs on the Java Virtual Machine [JVM](https://en.wikipedia.org/wiki/Java_virtual_machine), and has conquered corporate environments precisely by maintaining compatibility with JAVA and being a pure language functional.

I've already studied and worked with various programming languages, but what struck me the most in Clojure is its almost alien syntax, I remembered the movie the Predator, great.

* Clojure is an alien dialect

![Screen1]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-07-22/clojure-predator.jpg)
{: .align-center}


## 1. Installing

I used FreeBSD to make this article, so to install clujure on FreeBSD simply type in the terminal the commands:

{%highlight bash%}
pkg install clojure leiningen 
{%endhighlight%}

In the above command we installed Clojure and [Leiningen](https://leiningen.org/) to automate projects.

### 1.1 Start 

Open another terminal session and enter the command <strong>lein repl</strong>:

{%highlight bash%}
lein repl

nREPL server started on port 23024 on host 127.0.0.1 - nrepl://127.0.0.1:23024
REPL-y 0.3.7, nREPL 0.2.12
Clojure 1.8.0
OpenJDK 64-Bit Server VM 1.8.0_172-b11
    Docs: (doc function-name-here)
          (find-doc "part-of-name-here")
  Source: (source function-name-here)
 Javadoc: (javadoc java-object-or-class-here)
    Exit: Control+D or (exit) or (quit)
 Results: Stored in vars *1, *2, *3, an exception in *e

user=> 

{%endhighlight%}

Ok, now it's possible for you to type the code in clojure and see the results.

{%highlight clojure%}
user=> (println "Hello World")
Hello World
nil
user=> 
{%endhighlight%}

All interaction with clojure starts with parentheses (...), as we can see we did a classic <strong>Hello World</strong> using the function <strong>println</strong> and it returns <strong>nil</strong> equivalent to a void or null.

### 1.2 Creating Functions 

To create functions we use <strong>defn</strong>:

{%highlight clojure%}
user=> (defn sigma [x y]
  #_=> (+ x y))
#'user/sigma
user=> 
{%endhighlight%}

If you wanted to multiply for example, just use the <strong>*</strong> operator or to divide <strong>/<strong>.

You can use the TAB to fill in commands automatically. Another example, looking for the intersection of the two vectors:

{%highlight clojure%}
user=> (clojure.set/intersection #{:a :b :c} #{:b :a :d})
#{:b :a}
{%endhighlight%}

### 1.3 Using reduce, map, filter

Reduce syntax:

{%highlight clojure%}
user=> (reduce + 0 '(1 2 3 4 5 6 7 8 9 10))
55

user=> (reduce * 1 '(1 2 3 4 5 6 7 8 9 10))
3628800
{%endhighlight%}

Map syntax:

{%highlight clojure%}
user=> (map inc [1 2 3])
(2 3 4)

user=> (map str ["a" "b" "c"] ["A" "B" "C"])
("aA" "bB" "cC")
{%endhighlight%}

Filter syntax:

{%highlight clojure%}
user=> (def human-version
  #_=> [{:v 1.0 :day 100} 
  #_=>  {:v 2.0 :day 5}
  #_=>  {:v 1.5 :day 10}])
#'user/human-version

user=> (filter #(< (:v %) 2) human-version)
({:v 1.0, :day 100} {:v 1.5, :day 10})
{%endhighlight%}

### 1.4 More advanced Lazy Seqs 

Let's create a fictional alien database:

{%highlight clojure%}
(def alien-database
  {0 {:makes-blood-puns? false, :has-pulse? true  :name "Predator"}
   1 {:makes-blood-puns? false, :has-pulse? true  :name "Alien"}
   2 {:makes-blood-puns? true,  :has-pulse? false :name "E.T"}
   3 {:makes-blood-puns? true,  :has-pulse? true  :name "Yoda"}})

(defn alien-related-details
  [social-security-number]
  (Thread/sleep 1000)
  (get alien-database social-security-number))

(defn alien?
  [record]
  (and (:makes-blood-puns? record)
       (not (:has-pulse? record))
       record))

(defn identify-alien
  [social-security-numbers]
  (first (filter alien?
                 (map alien-related-details social-security-numbers))))

(time (vampire-related-details 0))
{%endhighlight%}

Let's see how long it takes to execute the function below:

{%highlight clojure%}
user=> (time (alien-related-details 0))
"Elapsed time: 1021.035913 msecs"
{:makes-blood-puns? false, :has-pulse? true, :name "Predator"}
{%endhighlight%}

Creating a range:

{%highlight clojure%}
user=> (time (def mapped-details (map alien-related-details (range 0 1000000))))
"Elapsed time: 0.182146 msecs"
{%endhighlight%}

## Considerations

Clojure is a very cool language to work on, at least it was my first impression, predicting to do other more advanced language tutorials, possibly using clojure for data analysis.

