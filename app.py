from flask import Flask, request, jsonify, render_template
import mysql.connector
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

db_config = {
    'host': os.getenv("DB_HOST"),
    'database': os.getenv("DB_NAME"),
    'user': os.getenv("DB_USER"),
    'port': os.getenv("DB_PORT"), 
    'password': os.getenv("DB_PASSWORD")
}

@app.route('/')
def index():
    return render_template('index.html')

def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

@app.route('/superheroes', methods=['GET'])
def get_superheroes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM superheroes")
    superheroes = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(superheroes)

@app.route('/superheroes', methods=['POST'])
def create_superheroe():
    data = request.json
    nombre = data['nombre']
    habilidad = data['habilidad']
    compania = data['compania']
    genero = data['genero']
    imagen = data.get('imagen')
    descripcion = data.get('descripcion')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO superheroes (nombre, habilidad, compania, genero, imagen, descripcion)
                      VALUES (%s, %s, %s, %s, %s, %s)""",
                   (nombre, habilidad, compania, genero, imagen, descripcion))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({"id": new_id, "message": "Superhéroe creado exitosamente"}), 201

@app.route('/superheroes/<int:id>', methods=['GET'])
def get_superheroe(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM superheroes WHERE id = %s", (id,))
    superhero = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if superhero:
        return jsonify(superhero)
    else:
        return jsonify({"message": "Superhéroe no encontrado"}), 404

@app.route('/superheroes/<int:id>', methods=['PUT'])
def update_superheroe(id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""UPDATE superheroes SET nombre = %s, habilidad = %s, compania = %s, genero = %s, imagen = %s, descripcion = %s WHERE id = %s""",
                   (data['nombre'], data['habilidad'], data['compania'], data['genero'], data.get('imagen'), data.get('descripcion'), id))
    conn.commit()
   
    cursor.execute("SELECT * FROM superheroes WHERE id = %s", (id,))
    updated_superhero = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify(updated_superhero)

@app.route('/editar_superheroe/<int:id>', methods=['PUT'])
def editar_superheroe(id):
    data = request.json
    nombre = data.get('nombreHeroe')
    poder = data.get('poder')
    compania = data.get('compania')
    genero = data.get('genero')
    descripcion = data.get('descripcion')
    
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("UPDATE superheroes SET nombre = %s, poder = %s, compania = %s, genero = %s, descripcion = %s WHERE id = %s", (nombre, poder, compania, genero, descripcion, id))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'mensaje': 'Superhéroe actualizado'}), 200

@app.route('/superheroes/<int:id>', methods=['DELETE'])
def delete_superheroe(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM superheroes WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Superhéroe eliminado exitosamente"})

if __name__ == '__main__':
    app.run(debug=True)
