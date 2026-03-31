-- AlterTable
ALTER TABLE "PaymentMethod" DROP COLUMN "brand",
DROP COLUMN "methodDetails",
ADD COLUMN     "cardholderName" TEXT,
ADD COLUMN     "expiryMonth" INTEGER,
ADD COLUMN     "expiryYear" INTEGER;

