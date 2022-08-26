const ConvertLib = artifacts.require("ConvertLib");
const MetaCoin = artifacts.require("MetaCoin");
const Item = artifacts.require("Item");
const ItemManager = artifacts.require("ItemManager");
const Ownable = artifacts.require("Ownable");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);

  deployer.deploy(ItemManager);
};
