function vector(x_coordinate, y_coordinate) 
{
	this.x_coordinate = x_coordinate;
	this.y_coordinate = y_coordinate;
	this.norm = function(){
		let x_squared = Math.pow(this.x_coordinate, 2);
		let y_squared = Math.pow(this.y_coordinate, 2);
		let result = Math.sqrt(x_squared + y_squared);
		return result;
	}
	this.dot_product = function(other_vector){
		let result_x_coordinate = this.x_coordinate * other_vector.x_coordinate;
		let result_y_coordinate = this.y_coordinate * other_vector.y_coordinate;
		let result = result_x_coordinate + result_y_coordinate;
		return result;
	}
	this.calculate_theta = function(other_vector){
		let numerator = this.dot_product(other_vector);
		let this_norm = this.norm();
		let other_norm = other_vector.norm();
		let denominator = this_norm + other_norm;
		let result = numerator / denominator;
		return result;
	}
	this.cross_product = function(other_vector){
		let dot_product_result = this.dot_product(other_vector);
		let theta = this.calculate_theta(other_vector);
		let result = dot_product_result * Msth.sin(theta);
		return result;
	}
}