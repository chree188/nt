'use strict';


var NebudrawContract = function ()
{
  LocalContractStorage.defineMapProperty(this, "canvas")
}

const WIDTH = 100
const HEIGHT = 100
const COLOR_COUNT = 16777216

const MAX_POINTS = 200

NebudrawContract.prototype =
{
  init: function () 
  {

  },

  _getPointKey: function(point)
  {
    return point.x + "," + point.y
  },

  _getKey: function(x, y)
  {
    return x + "," + y
  },

  draw: function(data)
  {
    const points = JSON.parse(data)

    if(points.length > MAX_POINTS)
    {
      throw new Error("Too many points.")
    }

    for(const point of points)
    {
      if(point.x < 0 || point.x >= WIDTH || point.y < 0 || point.y >= HEIGHT || point.color < 0 || point.color >= COLOR_COUNT)
      {
        throw new Error("Point is not valid.")
      }

      this.canvas.set(this._getPointKey(point), point.color.toString())
    }

    Event.Trigger("nebudraw.draw",
    { 
      from: Blockchain.transaction.from,
      points
    })
  },

  getCanvas: function(x, y, width, height)
  {
    let points = []

    for(let yy = y; yy < y + height; yy++)
    {
      for(let xx = x; xx < x + width; xx++)
      {
        const color = this.canvas.get(this._getKey(xx, yy))

        if(color)
        {
          points.push({x: xx, y: yy, color: parseInt(color)})
        }
      }
    }

    return points
  }
};

module.exports = NebudrawContract