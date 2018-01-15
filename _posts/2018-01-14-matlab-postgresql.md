---
date:   2018-01-14
title: "Using MATLAB with PostgreSQL database"
categories: 
    - Tutorials
excerpt: Using MATLAB with PostgreSQL database using PostGIS module to read data from the route of an aircraft.
tags: 
    - MATLAB 
    - PostgreSQL
    - Plot
    - GeoShow
    - PostGIS
---

{% include toc %}

# Overview

I was doing some tests with reading data using [MATLAB](https://ch.mathworks.com) with [PostgreSQL](https://www.postgresql.org) relational database and also using the [PostGIS](https://postgis.net) module.

In the database we have the advantage of creating our procedures and views and returning the data practically ready to analyze them, I'm saying this in the case of large structures.

I will describe below how to enable the PostgreSQL drive for MATLAB version R2017a and how to connect to the database and make three simple graphs with geographic coordinates and aircraft altitude.

## 1. Configuring the driver in MATLAB

* Download the PostgreSQL JDBC driver at [https://jdbc.postgresql.org/download.html](https://jdbc.postgresql.org/download.html).

<strong>Attention!</strong> I am using PostgreSQL version 10 but the only JDBC driver that worked for me was 8.4-703 JDBC 4 file [postgresql-8.4-703.jdbc4.jar](https://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar) using a Windows-7 64 installed in a virtual machine.

* After downloading the file copy the same to the installation directory of MATLAB: <i>C:\Program Files\MATLAB\R2017a</i>
* Now edit the file as administrator: <i>C:\Program Files\MATLAB\R2017a\toolbox\local\classpath.txt</i>
* At the end of the file add the path to load the driver: <i>C:\Program Files\MATLAB\R2017a\postgresql-8.4-703.jdbc4.jar</i>

Now start the MATLAB within Apps you do tests with the Database Explorer, obviously you need to have a database set up for testing. 

There is a document on the MATLAB website to make the installation you find useful by clicking [here](https://ch.mathworks.com/products/database/driver-installation.html).

## 2. Creating a test class for the databases

MATLAB has some functions to access the database, you can see clicking [here](https://ch.mathworks.com/help/database/ug/database.html). I  created a simple class called <strong>Database</strong> that connects to the database and returns a method containing my table of routes.

{%highlight matlab%}
% File: Database.m
classdef Database < handle
    properties (Access = private)
        m_datasource = 'avionics';
        m_username = 'jack';
        m_password = 'jackdaniels';
        m_driver = 'org.postgresql.Driver';
        m_url = 'jdbc:postgresql://localhost:5432/avionics';
        m_schema = 'public';
        m_conn = 0;
    end
    
    properties (Access = public)
        record = 0;
    end
    
    methods (Access = protected)
        
        function connect(obj)
            obj.m_conn = database(obj.m_datasource, obj.m_username, obj.m_password, obj.m_driver, obj.m_url);
            
            switch isopen(obj.m_conn)
                case 1
                    disp('Connection with database is OK.')
                otherwise
                    error('Failed to connection with database.')
            end
            fprintf(1, '\n')
        end
        
    end

    methods (Access = public)
        
        function obj = Database()
            disp('Initialize database...')
            obj.connect();
        end
        
        function disconnect(obj)
            disp('Closing connect with database...')
            close(obj.m_conn)
        end
        
        function sqlGetAircraftRoute(obj, aircraft)
            try
                tic
                fprintf('Running query to get (aircraft route). Please wait...\n')
                q = "SELECT * FROM " + obj.m_schema + ".func_gis_route(0) WHERE aircraft=" + aircraft;
                fprintf('\tSQL> %s\n', q)
                obj.record = select(obj.m_conn, q);
                toc
                fprintf(1, '\n')
            catch
                warning('Database:sqlGetAircraftRoute',...
                    'Failed to execute query: %s', q)
            end
        end
        
    end
end
{%endhighlight%}

The above class will connect to the database and fetch the data in the procedure I want to view. Create another file named Avionic and add the code below.

{%highlight matlab%}
% File: Avionic.m

% Instance the class of the database.
db = Database();

% Search the 747-8F data of the last flight of the aircraft.
db.sqlGetAircraftRoute('747-8F')
route = db.record;

% Close connection with database.
db.disconnect()

% Geo show plot.
figure('name', 'Plot 747-8F Route - Geo', 'NumberTitle', 'off')
geoshow(route.latitude, route.longitude, 'DisplayType', 'line')
colorbar()
wmline(route.latitude, route.longitude)

% Write KML projections.
kmlwriteline('747-8F.kml', route.latitude, route.longitude, route.altitude)

% Set map and ellipsoid.
figure('name', 'Plot 747-8F Route - Globe', 'NumberTitle', 'off')
axesm('globe', 'geoid', wgs84Ellipsoid)

% Create background.
load topo
meshm(topo, topolegend, size(topo)); 
demcmap(topo);
colorbar()

% Plot route.
plot3m(double(route.latitude), double(route.longitude), double(route.altitude), 'r-')
{%endhighlight%}

In the code above we created three graphs to plot the route of the aircraft. Analyzing the information:

![Screen1]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-01-14/1.png)
{: .align-center}

Press the F5 key to run the code, then click on your workspace to view the route data.

![Screen2]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-01-14/2.png)
{: .align-center}

The first graph to show is the map of the geoshow() function plotting the route of the aircraft.

![Screen3]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-01-14/3.png)
{: .align-center}

The next chart shows the scala without the map, the routes are written in KML format that can then be viewed in google maps or google earth.

![Screen4]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-01-14/4.png)
{: .align-center}

The last chart uses the plot3d() function and takes into account the altitude of the aircraft.

![Screen5]({{ site.url }}{{ site.baseurl }}/assets/images/blog/2018-01-14/5.png)
{: .align-center}

## 3. Final considerations

IMHO, MATLAB is a very powerful, objective and easy-to-learn tool, it's good for testing concepts and getting things done quickly, but not for scalar use.

