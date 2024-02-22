
const http = require('http');
const Sequelize = require('sequelize');
const url = require("url");
const fs = require('fs');
const {DataTypes, where, Transaction} = require("sequelize");

const database = new Sequelize('University', 'Kirill_user', '1111', {
    host: 'localhost',
    dialect: 'mssql',
    beforeBulkDestroy: (options) => {
        options.individualHooks = true;
        return options;
    },
    pool: {
        max: 10,
        min: 1
    }
});


database.addHook('beforeDestroy',  (instance, options) => {
    console.log('Before destroy');
});


const Faculty = database.define('Faculty', {
    FACULTY: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    FACULTY_NAME: {
        type: DataTypes.STRING
    }
},
    {
        tableName: 'FACULTY',
        timestamps: false
    });

const Pulpit = database.define('Pulpit', {
    PULPIT: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    PULPIT_NAME: {
        type: DataTypes.STRING
    },
    FACULTY: {
        type: DataTypes.STRING
    }
},
    {
        tableName: 'PULPIT',
        timestamps: false
    });

const Subject = database.define('Subject', {
    SUBJECT: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    SUBJECT_NAME: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'SUBJECT',
    timestamps: false
});

const Teacher = database.define('Teacher', {
    TEACHER: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    TEACHER_NAME: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TEACHER',
    timestamps: false
});

const AuditoriumType = database.define('AuditoriumType', {
    AUDITORIUM_TYPE: {
        type: DataTypes.CHAR(10),
        primaryKey: true
    },
    AUDITORIUM_TYPENAME: {
        type: DataTypes.CHAR(30)
    }
}, {
    tableName: 'AUDITORIUM_TYPE',
    timestamps: false
});

const Auditorium = database.define('Auditorium', {
    AUDITORIUM: {
        type: DataTypes.CHAR(10),
        primaryKey: true
    },
    AUDITORIUM_NAME: {
        type: DataTypes.STRING
    },
    AUDITORIUM_CAPACITY: {
        type: DataTypes.INTEGER
    },
    AUDITORIUM_TYPE: {
        type: DataTypes.CHAR(10),
        references: {
            model: AuditoriumType,
            key: 'AUDITORIUM_TYPE'
        }
    }
}, {
    tableName: 'AUDITORIUM',
    timestamps: false
});

Auditorium.addScope('capacityRange', {
    where: {
        AUDITORIUM_CAPACITY: {
            [Sequelize.Op.between]: [10, 60]
        }
    }
});

Auditorium.beforeCreate((faculty, options) => {
    console.log(`Before create in Faculty`);
});

Auditorium.afterCreate((faculty, options) => {
    console.log(`After create in Faculty`);
});


Faculty.hasMany(Pulpit, { foreignKey: 'FACULTY' });
Pulpit.hasMany(Subject, { foreignKey: 'PULPIT' });
Subject.hasOne(Teacher, { foreignKey: 'PULPIT' });
Auditorium.belongsTo(AuditoriumType, { foreignKey: 'AUDITORIUM_TYPE', hooks: true});
AuditoriumType.hasMany(Auditorium, {foreignKey: 'AUDITORIUM_TYPE'});




const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('Main_page.html'));
    }

    else if (request.method === 'GET' && request.url === '/api/transaction') {
        database.transaction().then(async (transaction) => {
            try {
                // Изменяем вместимость всех аудиторий на 0
                await Auditorium.update(
                    { capacity: 0 },
                    { where: { capacity: { [Sequelize.Op.gte]: 0 } }, transaction }
                );

                await transaction.commit();

                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify('Capacities changed to 0'));

                setTimeout(() => {
                    // Откатываем транзакцию после 10 секунд
                    console.log('Transaction rolled back.')
                }, 10000);
            } catch (error) {
                // Если возникает ошибка, откатываем транзакцию
                await transaction.rollback();
                response.writeHead(500, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(error));
            }
        });
    }

    else if (request.method === 'GET' && request.url === '/api/faculties') {
        Faculty.findAll().then((faculty) => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(faculty, null, 2));
        });
    }

    else if (request.method === 'GET' && request.url === '/api/pulpits') {
        Pulpit.findAll().then(pulpit => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(pulpit, null, 2));
        });
    }

    else if (request.method === 'GET' && request.url === '/api/subjects') {
        Subject.findAll().then(subject => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(subject, null, 2));
        }).catch(error => {

        });
    }

    else if (request.method === 'GET' && request.url === '/api/teachers') {
        Teacher.findAll().then(teacher => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(teacher, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(`Error: ${error}`));
        });
    }

    else if (request.method === 'GET' && request.url.startsWith('/api/teachers/')) {
        const teacherId = request.url.split('/')[3];

        Teacher.findOne({
            where: {
                TEACHER: teacherId
            }
        }).then(teacher => {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(teacher));
        })
            .catch(error => {
                console.error('Error:', error);
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Internal server error'}));
            });
    }

    else if (request.method === 'GET' && request.url === '/api/auditoriumstypes') {
        AuditoriumType.findAll().then(auditoriumType => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(auditoriumType, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(`Error: ${error}`);
        });
    }

    else if (request.method === 'GET' && request.url === '/api/auditoriums') {
        Auditorium.findAll().then(auditorium => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(auditorium, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(`Error: ${error}`);
        });
    }

    else if (request.method === 'GET' && request.url.startsWith('/api/faculties/') && request.url.endsWith('/subjects')) {
        const facultyCode = request.url.split('/')[3];
        Faculty.findAll({
            where: {FACULTY: 'ИЭФ'},
            include: {
                model: Pulpit,
                attributes: ['PULPIT', 'PULPIT_NAME'],
                include: {
                    model: Subject,
                    attributes: ['SUBJECT_NAME']
                }
            }
        }).then(faculty => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(faculty, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(`Error: ${error}`);
        });
    }

    else if (request.method === 'GET' && request.url.startsWith('/api/auditoriumtypes/') && request.url.endsWith('/auditoriums')) {
        const auditorium_type = request.url.split('/')[3];
        AuditoriumType.findAll({
            where: {AUDITORIUM_TYPE: auditorium_type},
            include: {
                model: Auditorium,
                attributes: ['AUDITORIUM', 'AUDITORIUM_CAPACITY']
            }
        }).then(auditoriums => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(auditoriums, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(`Error: ${error}`);
        });
    }

    else if (request.method === 'GET' && request.url === '/api/scope') {
        Auditorium.scope('capacityRange').findAll().then(auditoriums => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(auditoriums, null, 2));
        }).catch(error => {
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(`Error: ${error}`);
        })
    }

    else if (request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        if (request.url === '/api/faculties') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Faculty.create({
                    FACULTY: o.faculty,
                    FACULTY_NAME: o.faculty_name
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                })
            });
        }

        else if (request.url === '/api/pulpits') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Pulpit.create({
                    PULPIT: o.pulpit,
                    PULPIT_NAME: o.pulpit_name,
                    FACULTY: o.faculty
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch((error) => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url === '/api/subjects') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Subject.create({
                    SUBJECT: o.subject,
                    SUBJECT_NAME: o.subject_name,
                    PULPIT: o.pulpit
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch((error) => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url === '/api/teachers') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Teacher.create({
                    TEACHER: o.teacher,
                    TEACHER_NAME: o.teacher_name,
                    PULPIT: o.pulpit
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch((error) => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(`Error: ${error.message}`));
                });
            });
        }

        else if (request.url === '/api/auditoriumstypes') {
            request.on('end', () => {
                let o = JSON.parse(body);
                AuditoriumType.create({
                    AUDITORIUM_TYPE: o.auditorium_type,
                    AUDITORIUM_TYPENAME: o.auditorium_typename
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch((error) => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url === '/api/auditoriums') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Auditorium.create({
                    AUDITORIUM: o.auditorium,
                    AUDITORIUM_NAME: o.auditorium_name,
                    AUDITORIUM_CAPACITY: parseInt(o.auditorium_capacity),
                    AUDITORIUM_TYPE: o.auditorium_type
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Added successfully`);
                }).catch((error) => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }
    }

    else if (request.method === 'PUT') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        if (request.url === '/api/faculties') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Faculty.findByPk(o.faculty).then(faculty => {
                    if (faculty) {
                        return faculty.update({
                            FACULTY: o.faculty,
                            FACULTY_NAME: o.faculty_name
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(`Error: ${error}`);
                        });
                    }
                });
            });
        }

        else if (request.url === '/api/pulpits') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Pulpit.findByPk(o.pulpit).then(pulpit => {
                    if (pulpit) {
                        return pulpit.update({
                            PULPIT: o.pulpit,
                            PULPIT_NAME: o.pulpit_name,
                            FACULTY: o.faculty
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(`Error: ${error}`);
                        });
                    }
                });
            });
        }

        else if (request.url === '/api/subjects') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Subject.findByPk(o.subject).then(subject => {
                    if (subject) {
                        return subject.update({
                            SUBJECT: o.subject,
                            SUBJECT_NAME: o.subject_name,
                            PULPIT: o.pulpit
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(`Error: ${error}`);
                        });
                    }
                });
            });
        }

        else if (request.url === '/api/teachers') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Teacher.findByPk(o.teacher).then(teacher => {
                    if (teacher) {
                        return teacher.update({
                            TEACHER: o.teacher,
                            TEACHER_NAME: o.teacher_name,
                            PULPIT: o.pulpit
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(JSON.stringify(`Error: ${error}`));
                        });
                    }
                });
            });
        }

        else if (request.url === '/api/auditoriumstypes') {
            request.on('end', () => {
                let o = JSON.parse(body);
                AuditoriumType.findByPk(o.auditorium_type).then(auditorium_type => {
                    if (auditorium_type) {
                        return auditorium_type.update({
                            AUDITORIUM_TYPE: o.auditorium_type,
                            AUDITORIUM_TYPENAME: o.auditorium_typename
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(`Error: ${error}`);
                        });
                    }
                });
            });
        }

        else if (request.url === '/api/auditoriums') {
            request.on('end', () => {
                let o = JSON.parse(body);
                Auditorium.findByPk(o.auditorium).then(auditorium => {
                    if (auditorium) {
                        return auditorium.update({
                            AUDITORIUM: o.auditorium,
                            AUDITORIUM_NAME: o.auditorium_name,
                            AUDITORIUM_CAPACITY: o.auditorium_capacity,
                            AUDITORIUM_TYPE: o.auditorium_type
                        }).then(() => {
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(`Updated successfully`);
                        }).catch((error) => {
                            response.writeHead(500, {'Content-Type': 'application/json'});
                            response.end(`Error: ${error}`);
                        });
                    }
                });
            });
        }
    }

    else if (request.method === 'DELETE') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        if (request.url.startsWith('/api/faculties/')) {
            const facultyCode = request.url.split('/')[3];
            request.on('end', () => {
                Faculty.destroy({
                    where: {
                        FACULTY: facultyCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url.startsWith('/api/pulpits/')) {
            const pulpitCode = request.url.split('/')[3];
            request.on('end', () => {
                Pulpit.destroy({
                    where: {
                        PULPIT: pulpitCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url.startsWith('/api/subjects/')) {
            const subjectCode = request.url.split('/')[3];
            request.on('end', () => {
                Subject.destroy({
                    where: {
                        SUBJECT: subjectCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url.startsWith('/api/teachers/')) {
            const teacherCode = request.url.split('/')[3];
            request.on('end', () => {
                Teacher.destroy({
                    where: {
                        TEACHER: teacherCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(`Error: ${error}`));
                });
            });
        }

        else if (request.url.startsWith('/api/auditoriumstypes/')) {
            const auditoriumTypeCode = request.url.split('/')[3];
            request.on('end', () => {
                AuditoriumType.destroy({
                    where: {
                        AUDITORIUM_TYPE: auditoriumTypeCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }

        else if (request.url.startsWith('/api/auditoriums/')) {
            const auditoriumCode = request.url.split('/')[3];
            request.on('end', () => {
                Auditorium.destroy({
                    where: {
                        AUDITORIUM: auditoriumCode
                    }
                }).then(() => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(`Deleted successfully`);
                }).catch(error => {
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(`Error: ${error}`);
                });
            });
        }
    }




}).listen(3000);

console.log('Server is working on http://localhost:3000');