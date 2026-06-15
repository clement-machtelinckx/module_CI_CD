#Create MySQL Image for JSP Tutorial Application
FROM mysql:9.7

COPY ./database/ /docker-entrypoint-initdb.d

EXPOSE 3306