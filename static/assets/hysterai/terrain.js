// Terrain Manager
class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
        this.hill = null;
        this.flag = null;
        
        this.createTerrain();
        this.createHill();
        this.createFlag();
    }
    
    createTerrain() {
        // Create large ground plane with high contrast bright green color
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00, // Bright green
            side: THREE.DoubleSide
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.ground.position.y = 0; // At ground level
        this.ground.receiveShadow = true;
        
        this.scene.add(this.ground);
        
        // Add some texture variation with grid pattern
        const gridHelper = new THREE.GridHelper(500, 50, 0x004400, 0x004400);
        gridHelper.position.y = 0.01; // Slightly above ground to avoid z-fighting
        this.scene.add(gridHelper);
    }
    
    createHill() {
        // Create hill geometry using multiple connected shapes for natural look
        const hillGroup = new THREE.Group();
        
        // Main hill base
        const baseGeometry = new THREE.ConeGeometry(20, 15, 8);
        const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
        
        const mainHill = new THREE.Mesh(baseGeometry, hillMaterial);
        mainHill.position.set(0, 7.5, 100); // Position at goal location, half height up
        mainHill.castShadow = true;
        mainHill.receiveShadow = true;
        
        hillGroup.add(mainHill);
        
        // Add smaller hills around for more natural terrain
        for (let i = 0; i < 5; i++) {
            const smallHillGeometry = new THREE.ConeGeometry(
                5 + Math.random() * 8, 
                3 + Math.random() * 6, 
                6
            );
            const smallHill = new THREE.Mesh(smallHillGeometry, hillMaterial);
            
            const angle = (i / 5) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            smallHill.position.set(
                Math.cos(angle) * distance,
                (3 + Math.random() * 6) / 2,
                100 + Math.sin(angle) * distance
            );
            
            smallHill.castShadow = true;
            smallHill.receiveShadow = true;
            hillGroup.add(smallHill);
        }
        
        // Add rocks and details
        for (let i = 0; i < 10; i++) {
            const rockGeometry = new THREE.BoxGeometry(
                1 + Math.random() * 2,
                1 + Math.random() * 2,
                1 + Math.random() * 2
            );
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dark gray
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            rock.position.set(
                (Math.random() - 0.5) * 200,
                0.5 + Math.random(),
                Math.random() * 200 - 50
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            hillGroup.add(rock);
        }
        
        this.hill = hillGroup;
        this.scene.add(this.hill);
    }
    
    createFlag() {
        // Create flag pole
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 12);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(0, 21, 100); // On top of the hill (15 + 6 for height)
        pole.castShadow = true;
        
        // Create flag
        const flagGeometry = new THREE.PlaneGeometry(8, 5);
        const flagMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff0000, // Red flag
            side: THREE.DoubleSide
        });
        
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(4, 24, 100); // Attached to pole
        flag.castShadow = true;
        
        // Add flag animation
        flag.userData = { originalX: flag.position.x, time: 0 };
        
        this.flag = new THREE.Group();
        this.flag.add(pole);
        this.flag.add(flag);
        
        this.scene.add(this.flag);
        
        // Animate flag waving
        this.animateFlag(flag);
    }
    
    animateFlag(flag) {
        const animate = () => {
            if (flag && flag.userData) {
                flag.userData.time += 0.1;
                flag.position.x = flag.userData.originalX + Math.sin(flag.userData.time) * 0.5;
                flag.rotation.z = Math.sin(flag.userData.time * 1.5) * 0.1;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    getHeightAt(x, z) {
        // Simple height calculation - return 0 for flat ground, higher values near hill
        const distanceToHill = Math.sqrt(Math.pow(x - 0, 2) + Math.pow(z - 100, 2));
        
        if (distanceToHill < 20) {
            // On the hill - calculate approximate height
            const hillHeight = Math.max(0, 15 * (1 - distanceToHill / 20));
            return hillHeight;
        }
        
        return 0; // Flat ground
    }
    
    isValidPosition(x, z) {
        // Check if position is within terrain bounds
        return Math.abs(x) < 250 && Math.abs(z) < 250;
    }
} 