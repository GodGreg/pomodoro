--CREATE DATABASE {NAME} => Heroku creates it for us

 --Serial incremenents by 1
 --Can't use end as it is a keyword
CREATE TABLE pomodoro(
    pomodoro_id SERIAL PRIMARY KEY, 
    name VARCHAR(255),
    startAt VARCHAR(255),
    pauseAt VARCHAR(255),
    finishAt VARCHAR(255), 
    webhook VARCHAR(255)
);



--Common SQL commands
--/l shows all databases
--/c connect to a database
--/dt show all tables in current database