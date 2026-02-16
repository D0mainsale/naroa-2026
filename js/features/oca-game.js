/**
 * JUEGO DE LA OCA - MICA EDITION
 * Obra: El Viaje de la Vida / Tablero del Destino
 */

class OcaGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.casillas = 63;
    this.jugadores = [{ id: 1, pos: 0, color: '#FF5722', nombre: 'TÚ' }, { id: 2, pos: 0, color: '#3F51B5', nombre: 'MICA' }];
    this.turno = 0; // 0: Jugador, 1: MICA (CPU)
    this.dado = 0;
    this.active = false;
    this.mensaje = '';
    this.animating = false;
  }

  init() {
    const container = document.getElementById('oca-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="oca-wrapper">
        <div class="game-header">
          <h2>🦢 La Oca de la Vida</h2>
          <span class="status">Tu turno</span>
        </div>
        <canvas id="oca-canvas" width="600" height="400"></canvas>
        <button class="roll-btn">Lanzar Dado</button>
      </div>
    `;

    this.canvas = document.getElementById('oca-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    container.querySelector('.roll-btn').addEventListener('click', () => {
      if (this.turno === 0 && !this.animating && this.active) this.lanzarDado();
    });

    this.active = true;
    this.draw();
  }

  lanzarDado() {
    this.animating = true;
    let rolls = 0;
    const rollInterval = setInterval(() => {
      this.dado = Math.floor(Math.random() * 6) + 1;
      this.draw();
      rolls++;
      if (rolls > 10) {
        clearInterval(rollInterval);
        this.moverJugador();
      }
    }, 100);
  }

  moverJugador() {
    const jugador = this.jugadores[this.turno];
    let pasos = this.dado;
    
    const pasoInterval = setInterval(() => {
      if (pasos > 0) {
        jugador.pos++;
        if (jugador.pos > this.casillas) {
          jugador.pos = this.casillas - (jugador.pos - this.casillas); // Rebote
        }
        pasos--;
        this.draw();
      } else {
        clearInterval(pasoInterval);
        this.checkCasillaEspecial(jugador);
      }
    }, 300);
  }

  checkCasillaEspecial(jugador) {
    // Lógica básica de Oca, Puentes, Posada, Cárcel, Muerte
    const especiales = {
      5: { tipo: 'OCA', salto: 9, msg: 'De Oca a Oca...' },
      9: { tipo: 'OCA', salto: 14, msg: '...y tiro porque me toca!' },
      6: { tipo: 'PUENTE', salto: 12, msg: 'De puente a puente...' },
      19: { tipo: 'POSADA', turnos: 1, msg: 'Pierdes un turno en la Posada' },
      58: { tipo: 'MUERTE', salto: 0, msg: '¡LA MUERTE! Vuelves al inicio' },
      63: { tipo: 'FIN', msg: '¡HAS GANADO!' }
    };

    const casilla = especiales[jugador.pos];
    if (casilla) {
      this.mensaje = casilla.msg;
      if (casilla.tipo === 'OCA' || casilla.tipo === 'PUENTE') {
        setTimeout(() => {
          jugador.pos = casilla.salto;
          this.draw();
          this.animating = false;
          // Si es Oca, repite turno. Si no, cambia.
          if (casilla.tipo !== 'OCA') this.cambiarTurno();
          else this.mensaje += ' (Tiras otra vez)';
        }, 1000);
      } else if (casilla.tipo === 'MUERTE') {
         setTimeout(() => {
          jugador.pos = 0;
          this.draw();
          this.animating = false;
          this.cambiarTurno();
         }, 1000);
      } else if (casilla.tipo === 'FIN') {
         this.active = false;
         alert(`${jugador.nombre} ha ganado!`);
      } else {
         this.animating = false;
         this.cambiarTurno();
      }
    } else {
      this.mensaje = '';
      this.animating = false;
      this.cambiarTurno();
    }
  }

  cambiarTurno() {
    this.turno = this.turno === 0 ? 1 : 0;
    const status = document.querySelector('.oca-wrapper .status');
    if (status) status.textContent = this.turno === 0 ? 'Tu turno' : 'Turno de MICA';
    
    if (this.turno === 1 && this.active) {
      setTimeout(() => this.lanzarDado(), 1000);
    }
  }

  draw() {
    // Fondo
    this.ctx.fillStyle = '#EEE';
    this.ctx.fillRect(0, 0, 600, 400);

    // Tablero espiral simplificado
    // Dibujar casillas
    const spiral = this.getSpiralPositions();
    
    spiral.forEach((pos, index) => {
        this.ctx.fillStyle = (index === 5 || index === 9 || index === 14) ? '#FFD700' : '#FFF';
        this.ctx.strokeStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 15, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(index, pos.x, pos.y);
    });

    // Jugadores
    this.jugadores.forEach((j, i) => {
       const pos = spiral[j.pos] || spiral[0];
       this.ctx.fillStyle = j.color;
       this.ctx.beginPath();
       this.ctx.arc(pos.x + (i*10 - 5), pos.y - 10, 8, 0, Math.PI*2);
       this.ctx.fill();
    });

    // Dado
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(530, 20, 50, 50);
    this.ctx.strokeRect(530, 20, 50, 50);
    this.ctx.fillStyle = '#000';
    this.ctx.font = '30px Arial';
    this.ctx.fillText(this.dado, 555, 55);

    // Mensaje
    if (this.mensaje) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 350, 500, 40);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(this.mensaje, 300, 375);
    }
  }

  getSpiralPositions() {
      // Generar posiciones en espiral para 64 casillas (0-63)
      const positions = [];
      let x = 50, y = 50, dx = 40, dy = 0;
      let step = 0;
      let stepsInLeg = 13;
      let legCount = 0;
      
      for(let i=0; i<=63; i++) {
        // Simple snake pattern for now for better mapping
        const row = Math.floor(i / 10);
        const col = i % 10;
        let px, py;
        if (row % 2 === 0) {
            px = 50 + col * 50;
        } else {
            px = 50 + (9 - col) * 50;
        }
        py = 50 + row * 50;
        positions.push({x: px, y: py});
      }
      return positions;
  }
}

window.OcaGame = new OcaGame();
