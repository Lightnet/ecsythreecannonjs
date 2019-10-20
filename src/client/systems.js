
import { gTrans } from "./g";
import { System } from "ecsy";
import {
  Object3D,
  PhysicsObject3D,
  Moving,
} from "./components.js";

export class Physics3DSystem extends System {

  constructor(world, attributes){
    super(world, attributes);
    this.IgnorePhysics = false;
    //this.IgnorePhysics = true;
  }
  execute(delta) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let physics = entity.getComponent(PhysicsObject3D).object;
      let object = entity.getComponent(Object3D).object;

      
      if(!this.IgnorePhysics){
        object.position.copy(physics.position);
        object.quaternion.copy(physics.quaternion);
      }
    }
  }
}

Physics3DSystem.queries = {
  entities: { components: [PhysicsObject3D, Object3D] }
};