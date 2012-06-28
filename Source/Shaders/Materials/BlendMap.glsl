/**
 * Samples a texture and returns a float. Used by {@link CompositeMaterial}.
 *
 * @name agi_getBlendAmount
 * @glslFunction 
 *
 * @returns {float} The sampled value.
 */

uniform sampler2D u_texture;
uniform vec2 u_repeat;
 
float agi_getBlendAmount(agi_materialInput materialInput)
{
    return texture2D(u_texture, fract(u_repeat * materialInput.st)).blend_map_channels;
}